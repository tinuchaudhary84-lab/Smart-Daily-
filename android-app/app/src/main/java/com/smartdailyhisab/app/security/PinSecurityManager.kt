package com.smartdailyhisab.app.security

import android.content.Context
import android.content.SharedPreferences
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey
import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

/**
 * Stores PIN hashes securely using Android Keystore (AES-256-GCM MasterKey + EncryptedSharedPreferences)
 * and PBKDF2WithHmacSHA256 salted hashing. Plain-text PINs are never persisted.
 */
class PinSecurityManager(context: Context) {

    private val masterKey = MasterKey.Builder(context)
        .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
        .build()

    private val prefs: SharedPreferences = EncryptedSharedPreferences.create(
        context,
        "smart_daily_hisab_secure_prefs",
        masterKey,
        EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
        EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
    )

    fun isPinConfigured(): Boolean = prefs.getBoolean(KEY_CONFIGURED, false)

    fun getPinLength(): Int = prefs.getInt(KEY_PIN_LENGTH, 4)

    fun getRecoveryQuestion(): String = prefs.getString(KEY_RECOVERY_QUESTION, "") ?: ""

    fun isAutoLockEnabled(): Boolean = prefs.getBoolean(KEY_AUTO_LOCK, true)

    fun setAutoLockEnabled(enabled: Boolean) {
        prefs.edit().putBoolean(KEY_AUTO_LOCK, enabled).apply()
    }

    fun setupPin(pin: String, question: String, answer: String): String {
        val salt = generateSalt()
        val recoveryKey = generateRecoveryKey()
        val pinHash = pbkdf2Hash(pin, salt)
        val answerHash = pbkdf2Hash(answer.trim().lowercase(), salt)
        val recoveryKeyHash = pbkdf2Hash(recoveryKey.uppercase(), salt)

        prefs.edit()
            .putBoolean(KEY_CONFIGURED, true)
            .putInt(KEY_PIN_LENGTH, pin.length)
            .putString(KEY_SALT, salt)
            .putString(KEY_PIN_HASH, pinHash)
            .putString(KEY_RECOVERY_QUESTION, question)
            .putString(KEY_RECOVERY_ANSWER_HASH, answerHash)
            .putString(KEY_RECOVERY_KEY_HASH, recoveryKeyHash)
            .apply()

        return recoveryKey
    }

    fun verifyPin(pin: String): Boolean {
        val salt = prefs.getString(KEY_SALT, null) ?: return false
        val expected = prefs.getString(KEY_PIN_HASH, null) ?: return false
        val actual = pbkdf2Hash(pin, salt)
        return MessageDigest.isEqual(actual.toByteArray(), expected.toByteArray())
    }

    fun changePin(currentPin: String, newPin: String): Boolean {
        if (!verifyPin(currentPin)) return false
        val salt = prefs.getString(KEY_SALT, null) ?: generateSalt()
        val newHash = pbkdf2Hash(newPin, salt)
        prefs.edit()
            .putInt(KEY_PIN_LENGTH, newPin.length)
            .putString(KEY_PIN_HASH, newHash)
            .apply()
        return true
    }

    fun verifyRecoveryAnswer(answer: String): Boolean {
        val salt = prefs.getString(KEY_SALT, null) ?: return false
        val expected = prefs.getString(KEY_RECOVERY_ANSWER_HASH, null) ?: return false
        val actual = pbkdf2Hash(answer.trim().lowercase(), salt)
        return MessageDigest.isEqual(actual.toByteArray(), expected.toByteArray())
    }

    fun verifyRecoveryKey(recoveryKey: String): Boolean {
        val salt = prefs.getString(KEY_SALT, null) ?: return false
        val expected = prefs.getString(KEY_RECOVERY_KEY_HASH, null) ?: return false
        val actual = pbkdf2Hash(recoveryKey.trim().uppercase(), salt)
        return MessageDigest.isEqual(actual.toByteArray(), expected.toByteArray())
    }

    fun resetPinAfterRecovery(newPin: String) {
        val salt = prefs.getString(KEY_SALT, null) ?: generateSalt()
        val newHash = pbkdf2Hash(newPin, salt)
        prefs.edit()
            .putInt(KEY_PIN_LENGTH, newPin.length)
            .putString(KEY_PIN_HASH, newHash)
            .apply()
    }

    private fun pbkdf2Hash(secret: String, salt: String): String {
        val spec = PBEKeySpec(secret.toCharArray(), salt.toByteArray(), 65536, 256)
        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        val bytes = factory.generateSecret(spec).encoded
        return bytes.joinToString("") { "%02x".format(it) }
    }

    private fun generateSalt(): String {
        val bytes = ByteArray(16)
        SecureRandom().nextBytes(bytes)
        return bytes.joinToString("") { "%02x".format(it) }
    }

    private fun generateRecoveryKey(): String {
        val alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        val random = SecureRandom()
        val raw = (1..12).map { alphabet[random.nextInt(alphabet.length)] }.joinToString("")
        return "${raw.substring(0, 4)}-${raw.substring(4, 8)}-${raw.substring(8, 12)}"
    }

    companion object {
        private const val KEY_CONFIGURED = "pin_configured"
        private const val KEY_PIN_LENGTH = "pin_length"
        private const val KEY_SALT = "pin_salt"
        private const val KEY_PIN_HASH = "pin_hash"
        private const val KEY_RECOVERY_QUESTION = "recovery_question"
        private const val KEY_RECOVERY_ANSWER_HASH = "recovery_answer_hash"
        private const val KEY_RECOVERY_KEY_HASH = "recovery_key_hash"
        private const val KEY_AUTO_LOCK = "auto_lock_background"
    }
}
