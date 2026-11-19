package com.smartdailyhisab.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.viewModels
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.lifecycle.DefaultLifecycleObserver
import androidx.lifecycle.LifecycleOwner
import androidx.lifecycle.ProcessLifecycleOwner
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.smartdailyhisab.app.ui.screens.*
import com.smartdailyhisab.app.ui.theme.SmartDailyHisabTheme
import com.smartdailyhisab.app.ui.viewmodel.HisabViewModel

class MainActivity : ComponentActivity() {

    private val viewModel: HisabViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        setContent {
            val isDark by viewModel.isDarkTheme.collectAsState()

            SmartDailyHisabTheme(darkTheme = isDark) {
                MainScaffold(viewModel)
            }
        }
    }
}

@Composable
private fun MainScaffold(viewModel: HisabViewModel) {
    val navController = rememberNavController()
    val backStack by navController.currentBackStackEntryAsState()
    val route = backStack?.destination?.route ?: "home"

    Scaffold(
        bottomBar = {
            NavigationBar {
                NavigationBarItem(
                    selected = route == "home",
                    onClick = { navController.navigate("home") { launchSingleTop = true } },
                    icon = { Icon(Icons.Default.Home, contentDescription = null) },
                    label = { Text("હોમ") }
                )
                NavigationBarItem(
                    selected = route == "history",
                    onClick = { navController.navigate("history") { launchSingleTop = true } },
                    icon = { Icon(Icons.Default.History, contentDescription = null) },
                    label = { Text("ઇતિહાસ") }
                )
                NavigationBarItem(
                    selected = route == "add",
                    onClick = { navController.navigate("add") { launchSingleTop = true } },
                    icon = { Icon(Icons.Default.AddCircle, contentDescription = null) },
                    label = { Text("ઉમેરો") }
                )
                NavigationBarItem(
                    selected = route == "reports",
                    onClick = { navController.navigate("reports") { launchSingleTop = true } },
                    icon = { Icon(Icons.Default.BarChart, contentDescription = null) },
                    label = { Text("રિપોર્ટ") }
                )
                NavigationBarItem(
                    selected = route == "settings",
                    onClick = { navController.navigate("settings") { launchSingleTop = true } },
                    icon = { Icon(Icons.Default.Settings, contentDescription = null) },
                    label = { Text("સેટિંગ્સ") }
                )
            }
        }
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = "home",
            modifier = Modifier.padding(padding)
        ) {
            composable("home") {
                DashboardScreen(
                    viewModel = viewModel,
                    onNavigateAdd = { navController.navigate("add") },
                    onNavigateHistory = { navController.navigate("history") }
                )
            }
            composable("history") { HistoryScreen(viewModel) }
            composable("add") {
                AddTransactionScreen(viewModel) {
                    navController.popBackStack("home", inclusive = false)
                }
            }
            composable("reports") { ReportsScreen(viewModel) }
            composable("settings") { SettingsScreen(viewModel) }
        }
    }
}
