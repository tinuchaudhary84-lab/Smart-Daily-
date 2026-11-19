package com.smartdailyhisab.app.ui.screens

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.smartdailyhisab.app.data.local.entity.CategoryEntity
import com.smartdailyhisab.app.data.local.entity.PaymentMethod
import com.smartdailyhisab.app.data.local.entity.TransactionEntity
import com.smartdailyhisab.app.data.local.entity.TransactionType
import com.smartdailyhisab.app.ui.theme.HisabBlue
import com.smartdailyhisab.app.ui.theme.HisabGreen
import com.smartdailyhisab.app.ui.theme.HisabRed
import com.smartdailyhisab.app.ui.viewmodel.HisabViewModel
import java.time.LocalDate

fun localizedCategoryName(cat: CategoryEntity?, lang: String): String {
    if (cat == null) return "Other"
    return when (lang) {
        "gu" -> cat.nameGu
        "hi" -> cat.nameHi
        else -> cat.nameEn
    }
}

@Composable
fun PinLockScreen(viewModel: HisabViewModel) {
    val isConfigured = remember { viewModel.securityManager.isPinConfigured() }
    var pinInput by remember { mutableStateOf("") }
    var confirmInput by remember { mutableStateOf("") }
    var step by remember { mutableStateOf(if (isConfigured) "unlock" else "setup_pin") }
    var pinLength by remember { mutableIntStateOf(if (isConfigured) viewModel.securityManager.getPinLength() else 4) }
    var securityAnswer by remember { mutableStateOf("") }
    var recoveryKeyShown by remember { mutableStateOf("") }
    var errorMsg by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(Icons.Default.Lock, contentDescription = null, tint = HisabBlue, modifier = Modifier.size(48.dp))
        Spacer(Modifier.height(12.dp))
        Text(
            text = when (step) {
                "unlock" -> "સ્માર્ટ દૈનિક હિસાબ"
                "setup_pin" -> "સુરક્ષિત PIN બનાવો"
                "confirm_pin" -> "PIN ની પુષ્ટિ કરો"
                "setup_question" -> "રિકવરી સુરક્ષા પ્રશ્ન"
                else -> "તમારી રિકવરી કી સાચવો"
            },
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        Spacer(Modifier.height(16.dp))

        if (step == "setup_question") {
            OutlinedTextField(
                value = securityAnswer,
                onValueChange = { securityAnswer = it },
                label = { Text("તમારા પ્રિય મિત્રનું નામ") },
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(16.dp))
            Button(
                onClick = {
                    if (securityAnswer.isNotBlank()) {
                        recoveryKeyShown = viewModel.securityManager.setupPin(
                            pinInput,
                            "તમારા પ્રિય મિત્રનું નામ શું છે?",
                            securityAnswer
                        )
                        step = "show_key"
                    }
                },
                modifier = Modifier.fillMaxWidth().height(52.dp)
            ) {
                Text("PIN સેટ કરો")
            }
        } else if (step == "show_key") {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(recoveryKeyShown, fontSize = 20.sp, fontWeight = FontWeight.Bold, color = HisabBlue)
                }
            }
            Spacer(Modifier.height(16.dp))
            Button(onClick = { viewModel.unlockApp() }, modifier = Modifier.fillMaxWidth().height(52.dp)) {
                Text("આગળ વધો")
            }
        } else {
            if (step == "setup_pin") {
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    FilterChip(selected = pinLength == 4, onClick = { pinLength = 4; pinInput = "" }, label = { Text("4 Digit") })
                    FilterChip(selected = pinLength == 6, onClick = { pinLength = 6; pinInput = "" }, label = { Text("6 Digit") })
                }
                Spacer(Modifier.height(12.dp))
            }

            val currentText = if (step == "confirm_pin") confirmInput else pinInput
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                repeat(pinLength) { idx ->
                    Box(
                        modifier = Modifier
                            .size(16.dp)
                            .background(
                                if (idx < currentText.length) HisabBlue else Color.LightGray,
                                CircleShape
                            )
                    )
                }
            }
            if (errorMsg.isNotEmpty()) {
                Spacer(Modifier.height(8.dp))
                Text(errorMsg, color = HisabRed)
            }
            Spacer(Modifier.height(24.dp))

            val rows = listOf(listOf("1", "2", "3"), listOf("4", "5", "6"), listOf("7", "8", "9"), listOf("", "0", "DEL"))
            rows.forEach { row ->
                Row(horizontalArrangement = Arrangement.spacedBy(16.dp), modifier = Modifier.padding(vertical = 6.dp)) {
                    row.forEach { key ->
                        if (key.isEmpty()) {
                            Spacer(Modifier.size(72.dp))
                        } else {
                            FilledTonalButton(
                                onClick = {
                                    errorMsg = ""
                                    if (key == "DEL") {
                                        if (step == "confirm_pin") confirmInput = confirmInput.dropLast(1)
                                        else pinInput = pinInput.dropLast(1)
                                    } else {
                                        if (step == "unlock" && pinInput.length < pinLength) {
                                            pinInput += key
                                            if (pinInput.length == pinLength) {
                                                if (viewModel.securityManager.verifyPin(pinInput)) {
                                                    viewModel.unlockApp()
                                                } else {
                                                    errorMsg = "ખોટો PIN"
                                                    pinInput = ""
                                                }
                                            }
                                        } else if (step == "setup_pin" && pinInput.length < pinLength) {
                                            pinInput += key
                                            if (pinInput.length == pinLength) step = "confirm_pin"
                                        } else if (step == "confirm_pin" && confirmInput.length < pinLength) {
                                            confirmInput += key
                                            if (confirmInput.length == pinLength) {
                                                if (confirmInput == pinInput) step = "setup_question"
                                                else {
                                                    errorMsg = "PIN મેળ ખાતો નથી"
                                                    confirmInput = ""
                                                }
                                            }
                                        }
                                    }
                                },
                                modifier = Modifier.size(72.dp),
                                shape = RoundedCornerShape(20.dp)
                            ) {
                                Text(key, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun DashboardScreen(viewModel: HisabViewModel, onNavigateAdd: () -> Unit, onNavigateHistory: () -> Unit) {
    val summary by viewModel.summary.collectAsState()
    val transactions by viewModel.transactions.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val lang by viewModel.languageCode.collectAsState()
    val curr by viewModel.currencySymbol.collectAsState()
    val catMap = remember(categories) { categories.associateBy { it.id } }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Card(
                colors = CardDefaults.cardColors(containerColor = HisabBlue),
                shape = RoundedCornerShape(24.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(Modifier.padding(20.dp)) {
                    Text("ઉપલબ્ધ બેલેન્સ / Available Balance", color = Color.White.copy(alpha = 0.85f))
                    Spacer(Modifier.height(6.dp))
                    Text(
                        "$curr${"%.2f".format(summary.availableBalance)}",
                        color = Color.White,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }

        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Card(Modifier.weight(1f), shape = RoundedCornerShape(20.dp)) {
                    Column(Modifier.padding(16.dp)) {
                        Text("કુલ આવક", style = MaterialTheme.typography.bodySmall)
                        Text("$curr${"%.0f".format(summary.totalIncome)}", color = HisabGreen, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    }
                }
                Card(Modifier.weight(1f), shape = RoundedCornerShape(20.dp)) {
                    Column(Modifier.padding(16.dp)) {
                        Text("કુલ ખર્ચ", style = MaterialTheme.typography.bodySmall)
                        Text("$curr${"%.0f".format(summary.totalExpenses)}", color = HisabRed, fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }

        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                Card(Modifier.weight(1f), shape = RoundedCornerShape(20.dp)) {
                    Column(Modifier.padding(16.dp)) {
                        Text("આજનો ખર્ચ", style = MaterialTheme.typography.bodySmall)
                        Text("$curr${"%.0f".format(summary.todayExpenses)}", color = HisabRed, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
                Card(Modifier.weight(1f), shape = RoundedCornerShape(20.dp)) {
                    Column(Modifier.padding(16.dp)) {
                        Text("આ મહિનાનો ખર્ચ", style = MaterialTheme.typography.bodySmall)
                        Text("$curr${"%.0f".format(summary.monthExpenses)}", color = HisabRed, fontSize = 18.sp, fontWeight = FontWeight.SemiBold)
                    }
                }
            }
        }

        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("તાજેતરના વ્યવહારો", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                TextButton(onClick = onNavigateHistory) { Text("બધું જુઓ") }
            }
        }

        if (transactions.isEmpty()) {
            item {
                OutlinedCard(modifier = Modifier.fillMaxWidth()) {
                    Column(Modifier.padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                        Text("હજી સુધી કોઈ વ્યવહાર નથી")
                        Spacer(Modifier.height(8.dp))
                        Button(onClick = onNavigateAdd) { Text("વ્યવહાર ઉમેરો") }
                    }
                }
            }
        } else {
            items(transactions.take(5), key = { it.id }) { tx ->
                val cat = catMap[tx.categoryId]
                ListItem(
                    headlineContent = { Text(localizedCategoryName(cat, lang), fontWeight = FontWeight.SemiBold) },
                    supportingContent = { Text("${tx.dateIso} · ${tx.paymentMethod.name} ${tx.notes}") },
                    trailingContent = {
                        Text(
                            "${if (tx.type == TransactionType.INCOME) "+" else "-"}$curr${tx.amount}",
                            color = if (tx.type == TransactionType.INCOME) HisabGreen else HisabRed,
                            fontWeight = FontWeight.Bold
                        )
                    }
                )
                HorizontalDivider()
            }
        }
    }
}

@Composable
fun AddTransactionScreen(viewModel: HisabViewModel, onSaved: () -> Unit) {
    val categories by viewModel.categories.collectAsState()
    val lang by viewModel.languageCode.collectAsState()
    var type by remember { mutableStateOf(TransactionType.EXPENSE) }
    var amountText by remember { mutableStateOf("") }
    var notes by remember { mutableStateOf("") }
    var dateIso by remember { mutableStateOf(LocalDate.now().toString()) }
    var paymentMethod by remember { mutableStateOf(PaymentMethod.CASH) }
    val filteredCats = categories.filter { it.type == type }
    var selectedCatId by remember(type, filteredCats) { mutableStateOf(filteredCats.firstOrNull()?.id ?: "") }
    var error by remember { mutableStateOf("") }

    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                Button(
                    onClick = { type = TransactionType.EXPENSE },
                    colors = ButtonDefaults.buttonColors(containerColor = if (type == TransactionType.EXPENSE) HisabRed else Color.Gray),
                    modifier = Modifier.weight(1f)
                ) { Text("ખર્ચ / Expense") }
                Button(
                    onClick = { type = TransactionType.INCOME },
                    colors = ButtonDefaults.buttonColors(containerColor = if (type == TransactionType.INCOME) HisabGreen else Color.Gray),
                    modifier = Modifier.weight(1f)
                ) { Text("આવક / Income") }
            }
        }
        item {
            OutlinedTextField(
                value = amountText,
                onValueChange = { amountText = it; error = "" },
                label = { Text("રકમ (₹)") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                modifier = Modifier.fillMaxWidth()
            )
        }
        item {
            Text("કેટેગરી", fontWeight = FontWeight.SemiBold)
            Spacer(Modifier.height(6.dp))
            Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                filteredCats.chunked(2).forEach { pair ->
                    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        pair.forEach { cat ->
                            FilterChip(
                                selected = selectedCatId == cat.id,
                                onClick = { selectedCatId = cat.id },
                                label = { Text(localizedCategoryName(cat, lang)) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                        if (pair.size == 1) Spacer(Modifier.weight(1f))
                    }
                }
            }
        }
        item {
            OutlinedTextField(
                value = dateIso,
                onValueChange = { dateIso = it },
                label = { Text("તારીખ (YYYY-MM-DD)") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                PaymentMethod.entries.take(3).forEach { pm ->
                    FilterChip(
                        selected = paymentMethod == pm,
                        onClick = { paymentMethod = pm },
                        label = { Text(pm.name) },
                        modifier = Modifier.weight(1f)
                    )
                }
            }
        }
        item {
            OutlinedTextField(
                value = notes,
                onValueChange = { notes = it },
                label = { Text("નોંધ / Notes") },
                modifier = Modifier.fillMaxWidth()
            )
        }
        if (error.isNotEmpty()) {
            item { Text(error, color = HisabRed) }
        }
        item {
            Button(
                onClick = {
                    val amt = amountText.toDoubleOrNull()
                    if (amt == null || amt <= 0.0) {
                        error = "કૃપા કરીને 0 થી મોટી રકમ દાખલ કરો"
                    } else if (selectedCatId.isNotEmpty()) {
                        viewModel.saveTransaction(type, amt, selectedCatId, dateIso, paymentMethod, notes)
                        onSaved()
                    }
                },
                modifier = Modifier.fillMaxWidth().height(56.dp),
                shape = RoundedCornerShape(16.dp)
            ) {
                Text("SAVE TRANSACTION / વ્યવહાર સાચવો", fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
fun HistoryScreen(viewModel: HisabViewModel) {
    val transactions by viewModel.transactions.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val lang by viewModel.languageCode.collectAsState()
    val curr by viewModel.currencySymbol.collectAsState()
    val catMap = remember(categories) { categories.associateBy { it.id } }
    var query by remember { mutableStateOf("") }
    var deleteCandidate by remember { mutableStateOf<TransactionEntity?>(null) }

    val filtered = transactions.filter {
        query.isBlank() ||
            it.notes.contains(query, ignoreCase = true) ||
            localizedCategoryName(catMap[it.categoryId], lang).contains(query, ignoreCase = true)
    }

    Column(Modifier.fillMaxSize().padding(16.dp)) {
        OutlinedTextField(
            value = query,
            onValueChange = { query = it },
            label = { Text("શોધો / Search") },
            modifier = Modifier.fillMaxWidth()
        )
        Spacer(Modifier.height(12.dp))
        LazyColumn(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            items(filtered, key = { it.id }) { tx ->
                ListItem(
                    headlineContent = { Text(localizedCategoryName(catMap[tx.categoryId], lang)) },
                    supportingContent = { Text("${tx.dateIso} · ${tx.notes}") },
                    trailingContent = {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                "${if (tx.type == TransactionType.INCOME) "+" else "-"}$curr${tx.amount}",
                                color = if (tx.type == TransactionType.INCOME) HisabGreen else HisabRed,
                                fontWeight = FontWeight.Bold
                            )
                            IconButton(onClick = { deleteCandidate = tx }) {
                                Icon(Icons.Default.Delete, contentDescription = "Delete", tint = HisabRed)
                            }
                        }
                    }
                )
                HorizontalDivider()
            }
        }
    }

    deleteCandidate?.let { candidate ->
        AlertDialog(
            onDismissRequest = { deleteCandidate = null },
            title = { Text("વ્યવહાર કાઢી નાખવો છે?") },
            confirmButton = {
                TextButton(onClick = {
                    viewModel.deleteTransaction(candidate.id)
                    deleteCandidate = null
                }) { Text("કાઢી નાખો", color = HisabRed) }
            },
            dismissButton = {
                TextButton(onClick = { deleteCandidate = null }) { Text("રદ કરો") }
            }
        )
    }
}

@Composable
fun ReportsScreen(viewModel: HisabViewModel) {
    val summary by viewModel.summary.collectAsState()
    val transactions by viewModel.transactions.collectAsState()
    val categories by viewModel.categories.collectAsState()
    val expenseByCat = remember(transactions, categories) {
        val grouped = transactions.filter { it.type == TransactionType.EXPENSE }.groupBy { it.categoryId }
        grouped.mapValues { (_, list) -> list.sumOf { it.amount } }
    }

    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(16.dp)) {
        item {
            Text("આવક વિરુદ્ધ ખર્ચ / Income vs Expense", fontWeight = FontWeight.Bold, fontSize = 18.sp)
            Spacer(Modifier.height(8.dp))
            Canvas(modifier = Modifier.fillMaxWidth().height(140.dp)) {
                val maxVal = maxOf(summary.totalIncome, summary.totalExpenses, 1.0).toFloat()
                val incW = (summary.totalIncome.toFloat() / maxVal) * size.width
                val expW = (summary.totalExpenses.toFloat() / maxVal) * size.width
                drawRect(color = HisabGreen, topLeft = Offset(0f, 16f), size = Size(incW, 44f))
                drawRect(color = HisabRed, topLeft = Offset(0f, 80f), size = Size(expW, 44f))
            }
        }
        item {
            Text("કેટેગરી મુજબ ખર્ચ / Category Breakdown", fontWeight = FontWeight.Bold, fontSize = 18.sp)
        }
        items(expenseByCat.entries.toList()) { (catId, total) ->
            val cat = categories.find { it.id == catId }
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
                Text(cat?.nameGu ?: catId)
                Text("₹${"%.2f".format(total)}", fontWeight = FontWeight.Bold, color = HisabRed)
            }
        }
    }
}

@Composable
fun SettingsScreen(viewModel: HisabViewModel) {
    val lang by viewModel.languageCode.collectAsState()
    val isDark by viewModel.isDarkTheme.collectAsState()
    val opening by viewModel.openingBalance.collectAsState()
    var openingInput by remember(opening) { mutableStateOf(opening.toString()) }

    LazyColumn(Modifier.fillMaxSize().padding(16.dp), verticalArrangement = Arrangement.spacedBy(14.dp)) {
        item { Text("સેટિંગ્સ / Settings", fontWeight = FontWeight.Bold, fontSize = 20.sp) }
        item {
            Text("ભાષા / Language")
            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                listOf("gu" to "ગુજરાતી", "hi" to "हिन्दी", "en" to "English").forEach { (code, label) ->
                    FilterChip(selected = lang == code, onClick = { viewModel.setLanguage(code) }, label = { Text(label) })
                }
            }
        }
        item {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween, verticalAlignment = Alignment.CenterVertically) {
                Text("ડાર્ક મોડ / Dark Mode")
                Switch(checked = isDark, onCheckedChange = { viewModel.setDarkTheme(it) })
            }
        }
        item {
            OutlinedTextField(
                value = openingInput,
                onValueChange = { openingInput = it },
                label = { Text("શરૂઆતનું બેલેન્સ / Opening Balance") },
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(Modifier.height(6.dp))
            Button(onClick = { openingInput.toDoubleOrNull()?.let { viewModel.updateOpeningBalance(it) } }) {
                Text("સાચવો / Save")
            }
        }
    }
}
