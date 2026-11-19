package com.smartdailyhisab.app.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import androidx.sqlite.db.SupportSQLiteDatabase
import com.smartdailyhisab.app.data.local.dao.HisabDao
import com.smartdailyhisab.app.data.local.entity.CategoryEntity
import com.smartdailyhisab.app.data.local.entity.HisabTypeConverters
import com.smartdailyhisab.app.data.local.entity.TransactionEntity
import com.smartdailyhisab.app.data.local.entity.TransactionType
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

@Database(
    entities = [TransactionEntity::class, CategoryEntity::class],
    version = 1,
    exportSchema = false
)
@TypeConverters(HisabTypeConverters::class)
abstract class HisabDatabase : RoomDatabase() {
    abstract fun hisabDao(): HisabDao

    companion object {
        @Volatile
        private var INSTANCE: HisabDatabase? = null

        fun getInstance(context: Context): HisabDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    HisabDatabase::class.java,
                    "smart_daily_hisab.db"
                )
                    .addCallback(object : Callback() {
                        override fun onCreate(db: SupportSQLiteDatabase) {
                            super.onCreate(db)
                            CoroutineScope(Dispatchers.IO).launch {
                                INSTANCE?.hisabDao()?.insertCategories(defaultCategories())
                            }
                        }
                    })
                    .build()
                INSTANCE = instance
                instance
            }
        }

        fun defaultCategories(): List<CategoryEntity> = listOf(
            // 16 Expense Categories
            CategoryEntity("exp_food", "Food", "ખોરાક", "भोजन", TransactionType.EXPENSE, 0xFFEF4444, true),
            CategoryEntity("exp_grocery", "Grocery", "કરિયાણું", "किराना", TransactionType.EXPENSE, 0xFFF97316, true),
            CategoryEntity("exp_vegetables", "Vegetables", "શાકભાજી", "सब्जियां", TransactionType.EXPENSE, 0xFF16A34A, true),
            CategoryEntity("exp_milk", "Milk", "દૂધ", "दूध", TransactionType.EXPENSE, 0xFF0EA5E9, true),
            CategoryEntity("exp_shopping", "Shopping", "ખરીદી", "खरीदारी", TransactionType.EXPENSE, 0xFFEC4899, true),
            CategoryEntity("exp_petrol", "Petrol", "પેટ્રોલ", "पेट्रोल", TransactionType.EXPENSE, 0xFFD97706, true),
            CategoryEntity("exp_transport", "Transportation", "પરિવહન", "परिवहन", TransactionType.EXPENSE, 0xFF6366F1, true),
            CategoryEntity("exp_electricity", "Electricity Bill", "વીજળી બિલ", "बिजली बिल", TransactionType.EXPENSE, 0xFFEAB308, true),
            CategoryEntity("exp_mobile", "Mobile Recharge", "મોબાઈલ રિચાર્જ", "मोबाइल रिचार्ज", TransactionType.EXPENSE, 0xFF06B6D4, true),
            CategoryEntity("exp_internet", "Internet Bill", "ઇન્ટરનેટ બિલ", "इंटरनेट बिल", TransactionType.EXPENSE, 0xFF3B82F6, true),
            CategoryEntity("exp_rent", "House Rent", "ઘરનું ભાડું", "घर का किराया", TransactionType.EXPENSE, 0xFF8B5CF6, true),
            CategoryEntity("exp_medical", "Medical", "દવા અને સારવાર", "चिकित्सा", TransactionType.EXPENSE, 0xFFF43F5E, true),
            CategoryEntity("exp_education", "Education", "શિક્ષણ", "शिक्षा", TransactionType.EXPENSE, 0xFF2563EB, true),
            CategoryEntity("exp_entertainment", "Entertainment", "મનોરંજન", "मनोरंजन", TransactionType.EXPENSE, 0xFFA855F7, true),
            CategoryEntity("exp_travel", "Travel", "પ્રવાસ", "यात्रा", TransactionType.EXPENSE, 0xFF14B8A6, true),
            CategoryEntity("exp_other", "Other Expenses", "અન્ય ખર્ચ", "अन्य खर्च", TransactionType.EXPENSE, 0xFF64748B, true),
            // 7 Income Categories
            CategoryEntity("inc_salary", "Salary", "પગાર", "वेतन", TransactionType.INCOME, 0xFF15803D, true),
            CategoryEntity("inc_business", "Business Income", "વ્યવસાય આવક", "व्यापार आय", TransactionType.INCOME, 0xFF0D9488, true),
            CategoryEntity("inc_freelance", "Freelancing", "ફ્રીલાન્સિંગ", "फ्रीलांसिंग", TransactionType.INCOME, 0xFF059669, true),
            CategoryEntity("inc_interest", "Interest", "વ્યાજ", "ब्याज", TransactionType.INCOME, 0xFF10B981, true),
            CategoryEntity("inc_investment", "Investment", "રોકાણ", "निवेश", TransactionType.INCOME, 0xFF0284C7, true),
            CategoryEntity("inc_gift", "Gift", "ભેટ", "उपहार", TransactionType.INCOME, 0xFF7C3AED, true),
            CategoryEntity("inc_other", "Other Income", "અન્ય આવક", "अन्य आय", TransactionType.INCOME, 0xFF475569, true)
        )
    }
}
