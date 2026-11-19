package com.smartdailyhisab.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val HisabBlue = Color(0xFF1D4ED8)
val HisabGreen = Color(0xFF15803D)
val HisabRed = Color(0xFFDC2626)

private val LightColors = lightColorScheme(
    primary = HisabBlue,
    onPrimary = Color.White,
    secondary = HisabGreen,
    error = HisabRed,
    background = Color(0xFFF8FAFC),
    surface = Color.White,
    onBackground = Color(0xFF0F172A),
    onSurface = Color(0xFF0F172A),
    surfaceVariant = Color(0xFFF1F5F9),
    outline = Color(0xFFE2E8F0)
)

private val DarkColors = darkColorScheme(
    primary = Color(0xFF3B82F6),
    onPrimary = Color.White,
    secondary = Color(0xFF22C55E),
    error = Color(0xFFF87171),
    background = Color(0xFF020617),
    surface = Color(0xFF0F172A),
    onBackground = Color(0xFFF8FAFC),
    onSurface = Color(0xFFF8FAFC),
    surfaceVariant = Color(0xFF1E293B),
    outline = Color(0xFF334155)
)

@Composable
fun SmartDailyHisabTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (darkTheme) DarkColors else LightColors,
        content = content
    )
}
