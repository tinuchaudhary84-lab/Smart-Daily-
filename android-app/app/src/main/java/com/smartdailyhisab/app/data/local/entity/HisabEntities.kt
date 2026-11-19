package com.smartdailyhisab.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey
import androidx.room.TypeConverter

enum class TransactionType {
    INCOME,
    EXPENSE
}

enum class PaymentMethod {
    CASH,
    UPI,
    BANK_TRANSFER,
    DEBIT_CARD,
    CREDIT_CARD,
    OTHER
}

@Entity(tableName = "categories")
data class CategoryEntity(
    @PrimaryKey val id: String,
    val nameEn: String,
    val nameGu: String,
    val nameHi: String,
    val type: TransactionType,
    val colorHex: Long,
    val isDefault: Boolean = false
)

@Entity(tableName = "transactions")
data class TransactionEntity(
    @PrimaryKey val id: String,
    val type: TransactionType,
    val amount: Double,
    val categoryId: String,
    val dateIso: String, // YYYY-MM-DD
    val paymentMethod: PaymentMethod,
    val notes: String,
    val createdAt: Long = System.currentTimeMillis(),
    val updatedAt: Long = System.currentTimeMillis()
)

class HisabTypeConverters {
    @TypeConverter
    fun fromTransactionType(value: TransactionType): String = value.name

    @TypeConverter
    fun toTransactionType(value: String): TransactionType = TransactionType.valueOf(value)

    @TypeConverter
    fun fromPaymentMethod(value: PaymentMethod): String = value.name

    @TypeConverter
    fun toPaymentMethod(value: String): PaymentMethod = PaymentMethod.valueOf(value)
}
