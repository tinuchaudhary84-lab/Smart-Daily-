package com.smartdailyhisab.app.ui.viewmodel

import android.app.Application
import android.content.Context
import android.graphics.Canvas
import android.graphics.Paint
import android.graphics.pdf.PdfDocument
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.smartdailyhisab.app.data.local.HisabDatabase
import com.smartdailyhisab.app.data.local.entity.CategoryEntity
import com.smartdailyhisab.app.data.local.entity.PaymentMethod
import com.smartdailyhisab.app.data.local.entity.TransactionEntity
import com.smartdailyhisab.app.data.local.entity.TransactionType
import com.smartdailyhisab.app.security.PinSecurityManager
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.combine
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import java.io.OutputStream
import java.time.LocalDate
import java.util.UUID

data class FinancialSummary(
    val openingBalance: Double = 0.0,
    val totalIncome: Double = 0.0,
    val totalExpenses: Double = 0.0,
    val availableBalance: Double = 0.0,
    val todayExpenses: Double = 0.0,
    val monthExpenses: Double = 0.0
)

data class BackupDocument(
    val version: Int = 1,
    val openingBalance: Double,
    val categories: List<CategoryEntity>,
    val transactions: List<TransactionEntity>
)

class HisabViewModel(application: Application) : AndroidViewModel(application) {

    private val dao = HisabDatabase.getInstance(application).hisabDao()
    val securityManager = PinSecurityManager(application)
    private val prefs = application.getSharedPreferences("hisab_settings", Context.MODE_PRIVATE)
    private val gson: Gson = GsonBuilder().setPrettyPrinting().create()

    private val _isLocked = MutableStateFlow(true)
    val isLocked: StateFlow<Boolean> = _isLocked

    private val _languageCode = MutableStateFlow(prefs.getString("language", "gu") ?: "gu")
    val languageCode: StateFlow<String> = _languageCode

    private val _isDarkTheme = MutableStateFlow(prefs.getBoolean("dark_theme", false))
    val isDarkTheme: StateFlow<Boolean> = _isDarkTheme

    private val _currencySymbol = MutableStateFlow(prefs.getString("currency", "₹") ?: "₹")
    val currencySymbol: StateFlow<String> = _currencySymbol

    private val _openingBalance = MutableStateFlow(prefs.getFloat("opening_balance", 0f).toDouble())
    val openingBalance: StateFlow<Double> = _openingBalance

    val transactions: StateFlow<List<TransactionEntity>> = dao.observeAllTransactions()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val categories: StateFlow<List<CategoryEntity>> = dao.observeAllCategories()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val summary: StateFlow<FinancialSummary> = combine(transactions, _openingBalance) { list, opening ->
        val today = LocalDate.now().toString()
        val monthPrefix = today.substring(0, 7)
        var totalIncome = 0.0
        var totalExpenses = 0.0
        var todayExpenses = 0.0
        var monthExpenses = 0.0

        list.forEach { tx ->
            if (tx.type == TransactionType.INCOME) {
                totalIncome += tx.amount
            } else {
                totalExpenses += tx.amount
                if (tx.dateIso == today) todayExpenses += tx.amount
                if (tx.dateIso.startsWith(monthPrefix)) monthExpenses += tx.amount
            }
        }
        FinancialSummary(
            openingBalance = opening,
            totalIncome = totalIncome,
            totalExpenses = totalExpenses,
            availableBalance = opening + totalIncome - totalExpenses,
            todayExpenses = todayExpenses,
            monthExpenses = monthExpenses
        )
    }.stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), FinancialSummary())

    fun unlockApp() {
        _isLocked.value = false
    }

    fun lockIfAutoLockEnabled() {
        if (securityManager.isPinConfigured() && securityManager.isAutoLockEnabled()) {
            _isLocked.value = true
        }
    }

    fun setLanguage(code: String) {
        _languageCode.value = code
        prefs.edit().putString("language", code).apply()
    }

    fun setDarkTheme(dark: Boolean) {
        _isDarkTheme.value = dark
        prefs.edit().putBoolean("dark_theme", dark).apply()
    }

    fun setCurrencySymbol(symbol: String) {
        _currencySymbol.value = symbol
        prefs.edit().putString("currency", symbol).apply()
    }

    fun updateOpeningBalance(amount: Double) {
        if (amount < 0) return
        _openingBalance.value = amount
        prefs.edit().putFloat("opening_balance", amount.toFloat()).apply()
    }

    fun saveTransaction(
        type: TransactionType,
        amount: Double,
        categoryId: String,
        dateIso: String,
        paymentMethod: PaymentMethod,
        notes: String,
        existingId: String? = null
    ) {
        if (amount <= 0.0) return
        viewModelScope.launch(Dispatchers.IO) {
            dao.upsertTransaction(
                TransactionEntity(
                    id = existingId ?: UUID.randomUUID().toString(),
                    type = type,
                    amount = amount,
                    categoryId = categoryId,
                    dateIso = dateIso,
                    paymentMethod = paymentMethod,
                    notes = notes.trim(),
                    updatedAt = System.currentTimeMillis()
                )
            )
        }
    }

    fun deleteTransaction(id: String) {
        viewModelScope.launch(Dispatchers.IO) {
            dao.deleteTransactionById(id)
        }
    }

    fun saveCustomCategory(nameEn: String, nameGu: String, nameHi: String, type: TransactionType, colorHex: Long) {
        viewModelScope.launch(Dispatchers.IO) {
            dao.upsertCategory(
                CategoryEntity(
                    id = "custom_${UUID.randomUUID()}",
                    nameEn = nameEn.trim(),
                    nameGu = nameGu.ifBlank { nameEn }.trim(),
                    nameHi = nameHi.ifBlank { nameEn }.trim(),
                    type = type,
                    colorHex = colorHex,
                    isDefault = false
                )
            )
        }
    }

    fun deleteCustomCategory(id: String) {
        viewModelScope.launch(Dispatchers.IO) {
            dao.deleteCustomCategory(id)
        }
    }

    fun exportBackupJson(outputStream: OutputStream) {
        viewModelScope.launch(Dispatchers.IO) {
            val doc = BackupDocument(
                openingBalance = _openingBalance.value,
                categories = dao.getAllCategoriesOnce(),
                transactions = dao.getAllTransactionsOnce()
            )
            outputStream.bufferedWriter(Charsets.UTF_8).use { writer ->
                writer.write(gson.toJson(doc))
            }
        }
    }

    fun restoreBackupJson(jsonText: String) {
        viewModelScope.launch(Dispatchers.IO) {
            val doc = gson.fromJson(jsonText, BackupDocument::class.java)
            updateOpeningBalance(doc.openingBalance)
            dao.insertCategories(doc.categories)
            dao.insertTransactions(doc.transactions.filter { it.amount > 0 })
        }
    }

    fun exportCsv(outputStream: OutputStream) {
        viewModelScope.launch(Dispatchers.IO) {
            val cats = dao.getAllCategoriesOnce().associateBy { it.id }
            val txs = dao.getAllTransactionsOnce()
            outputStream.bufferedWriter(Charsets.UTF_8).use { writer ->
                writer.write("\uFEFFDate,Type,Category,Amount,PaymentMethod,Notes\n")
                txs.forEach { tx ->
                    val catName = cats[tx.categoryId]?.nameEn ?: "Other"
                    val escapedNotes = "\"${tx.notes.replace("\"", "\"\"")}\""
                    writer.write("${tx.dateIso},${tx.type.name},$catName,${tx.amount},${tx.paymentMethod.name},$escapedNotes\n")
                }
            }
        }
    }

    fun exportPdf(outputStream: OutputStream) {
        viewModelScope.launch(Dispatchers.IO) {
            val pdf = PdfDocument()
            val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create()
            val page = pdf.startPage(pageInfo)
            val canvas: Canvas = page.canvas
            val paint = Paint().apply { textSize = 14f }
            var y = 48f
            canvas.drawText("Smart Daily Hisab - Financial Report", 40f, y, paint)
            y += 28f
            val s = summary.value
            canvas.drawText("Available Balance: ${_currencySymbol.value}${s.availableBalance}", 40f, y, paint)
            y += 22f
            canvas.drawText("Income: ${_currencySymbol.value}${s.totalIncome} | Expenses: ${_currencySymbol.value}${s.totalExpenses}", 40f, y, paint)
            y += 32f
            dao.getAllTransactionsOnce().take(28).forEach { tx ->
                canvas.drawText("${tx.dateIso} | ${tx.type.name} | ${_currencySymbol.value}${tx.amount} | ${tx.notes}", 40f, y, paint)
                y += 20f
            }
            pdf.finishPage(page)
            pdf.writeTo(outputStream)
            pdf.close()
        }
    }
}
