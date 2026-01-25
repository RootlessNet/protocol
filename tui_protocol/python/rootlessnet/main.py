"""
RootlessNet TUI Main Application
Beautiful terminal user interface for the decentralized Tor blockchain network
"""

import os
import json
import asyncio
from pathlib import Path
from typing import Optional

from textual.app import App, ComposeResult
from textual.containers import Container, Horizontal, Vertical, ScrollableContainer
from textual.widgets import (
    Header, Footer, Button, Static, Input, TextArea, 
    Label, DirectoryTree, Tabs, Tab, TabPane, TabbedContent,
    DataTable, LoadingIndicator, Markdown, RichLog
)
from textual.binding import Binding
from textual.screen import Screen
from textual import events
from rich.text import Text
from rich.panel import Panel
from rich.table import Table

from .identity import UserIdentity, generate_identity
from .blockchain import Blockchain
from .content import Content, ContentType


# Configuration directory
CONFIG_DIR = Path.home() / ".rootlessnet"
IDENTITY_FILE = CONFIG_DIR / "identity.json"
BLOCKCHAIN_FILE = CONFIG_DIR / "blockchain.json"
SETTINGS_FILE = CONFIG_DIR / "settings.json"


class WelcomeScreen(Screen):
    """Welcome screen shown on first launch"""
    
    CSS = """
    WelcomeScreen {
        align: center middle;
    }
    
    #welcome-box {
        width: 60;
        height: 20;
        border: solid green;
        padding: 1 2;
    }
    
    #welcome-title {
        text-align: center;
        color: $success;
        text-style: bold;
    }
    
    #welcome-buttons {
        height: auto;
        align: center middle;
        margin-top: 2;
    }
    
    Button {
        margin: 1;
    }
    """
    
    def compose(self) -> ComposeResult:
        with Container(id="welcome-box"):
            yield Static("🌐 Welcome to RootlessNet", id="welcome-title")
            yield Static("")
            yield Static("A decentralized Tor blockchain network")
            yield Static("for censorship-resistant communication.")
            yield Static("")
            yield Static("You need an identity to get started.")
            with Horizontal(id="welcome-buttons"):
                yield Button("Create New Identity", id="create-identity", variant="success")
                yield Button("Import Identity", id="import-identity", variant="primary")
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "create-identity":
            self.app.create_new_identity()
        elif event.button.id == "import-identity":
            self.app.push_screen(ImportIdentityScreen())


class ImportIdentityScreen(Screen):
    """Screen for importing an existing identity"""
    
    CSS = """
    ImportIdentityScreen {
        align: center middle;
    }
    
    #import-box {
        width: 80;
        height: 20;
        border: solid blue;
        padding: 1 2;
    }
    
    Input {
        margin: 1 0;
    }
    """
    
    def compose(self) -> ComposeResult:
        with Container(id="import-box"):
            yield Static("📥 Import Identity", classes="title")
            yield Static("")
            yield Label("Encrypted Identity Data (hex):")
            yield Input(id="encrypted-data", placeholder="Paste encrypted identity...")
            yield Label("Password:")
            yield Input(id="password", password=True, placeholder="Enter password...")
            with Horizontal():
                yield Button("Import", id="do-import", variant="success")
                yield Button("Cancel", id="cancel", variant="error")
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "do-import":
            encrypted = self.query_one("#encrypted-data", Input).value
            password = self.query_one("#password", Input).value
            if encrypted and password:
                try:
                    identity = UserIdentity.import_encrypted(encrypted, password)
                    self.app.identity = identity
                    self.app.save_identity()
                    self.app.pop_screen()
                    self.app.notify("Identity imported successfully!", severity="information")
                except Exception as e:
                    self.app.notify(f"Import failed: {e}", severity="error")
        elif event.button.id == "cancel":
            self.app.pop_screen()


class NewContentScreen(Screen):
    """Screen for uploading new content"""
    
    BINDINGS = [
        Binding("escape", "cancel", "Cancel"),
    ]
    
    CSS = """
    NewContentScreen {
        align: center middle;
    }
    
    #new-content-box {
        width: 90%;
        height: 90%;
        border: solid green;
        padding: 1 2;
    }
    
    .content-type-buttons {
        height: auto;
        align: center middle;
        margin: 1;
    }
    
    .form-field {
        margin: 1 0;
    }
    
    Button {
        margin: 0 1;
    }
    
    #content-form {
        height: auto;
        padding: 1;
    }
    """
    
    def __init__(self, content_type: ContentType):
        super().__init__()
        self.content_type = content_type
    
    def compose(self) -> ComposeResult:
        with Container(id="new-content-box"):
            yield Static(f"📤 Upload New {self.content_type.value.title()}", classes="title")
            yield Static("")
            
            with Vertical(id="content-form"):
                yield Label("Title:")
                yield Input(id="title", placeholder="Enter title...")
                
                yield Label("Description:")
                yield Input(id="description", placeholder="Enter description...")
                
                if self.content_type == ContentType.TEXT:
                    yield Label("Content:")
                    yield TextArea(id="text-content")
                else:
                    yield Label("File Path:")
                    yield Input(id="file-path", placeholder="Enter file path...")
                
                yield Label("Tags (comma-separated):")
                yield Input(id="tags", placeholder="tag1, tag2, tag3...")
            
            with Horizontal():
                yield Button("Upload", id="upload", variant="success")
                yield Button("Cancel", id="cancel", variant="error")
    
    def action_cancel(self) -> None:
        self.app.pop_screen()
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "upload":
            self._do_upload()
        elif event.button.id == "cancel":
            self.app.pop_screen()
    
    def _do_upload(self) -> None:
        title = self.query_one("#title", Input).value
        description = self.query_one("#description", Input).value
        tags_str = self.query_one("#tags", Input).value
        tags = [t.strip() for t in tags_str.split(",") if t.strip()] if tags_str else []
        
        if not title:
            self.app.notify("Title is required!", severity="error")
            return
        
        try:
            if self.content_type == ContentType.TEXT:
                text = self.query_one("#text-content", TextArea).text
                if not text:
                    self.app.notify("Content is required!", severity="error")
                    return
                content = Content.text(title, description, text)
            else:
                file_path = self.query_one("#file-path", Input).value
                if not file_path or not os.path.exists(file_path):
                    self.app.notify("Valid file path is required!", severity="error")
                    return
                
                if self.content_type == ContentType.PICTURE:
                    content = Content.picture(title, description, file_path)
                elif self.content_type == ContentType.VIDEO:
                    content = Content.video(title, description, file_path)
                else:
                    content = Content.file(title, description, file_path)
            
            # Add tags
            for tag in tags:
                content.add_tag(tag)
            
            # Add to blockchain
            block = self.app.blockchain.add_block(content, self.app.identity.public_key)
            self.app.save_blockchain()
            
            self.app.notify(f"Content uploaded! Block #{block.index}", severity="information")
            self.app.pop_screen()
            
        except Exception as e:
            self.app.notify(f"Upload failed: {e}", severity="error")


class ViewScreen(Screen):
    """Screen for viewing content by public key or content ID"""
    
    BINDINGS = [
        Binding("escape", "cancel", "Cancel"),
    ]
    
    CSS = """
    ViewScreen {
        align: center middle;
    }
    
    #view-box {
        width: 90%;
        height: 90%;
        border: solid blue;
        padding: 1 2;
    }
    
    #search-area {
        height: auto;
        margin: 1;
    }
    
    #results-area {
        height: 1fr;
        border: solid $primary;
        margin: 1;
    }
    """
    
    def compose(self) -> ComposeResult:
        with Container(id="view-box"):
            yield Static("🔍 View Content & Users", classes="title")
            
            with Horizontal(id="search-area"):
                yield Input(id="search-key", placeholder="Enter public key or content ID...")
                yield Button("Search", id="search", variant="primary")
                yield Button("All Posts", id="all-posts", variant="default")
            
            with ScrollableContainer(id="results-area"):
                yield RichLog(id="results", highlight=True, markup=True)
            
            with Horizontal():
                yield Button("Close", id="close", variant="error")
    
    def action_cancel(self) -> None:
        self.app.pop_screen()
    
    def on_mount(self) -> None:
        self._show_all_posts()
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "search":
            self._do_search()
        elif event.button.id == "all-posts":
            self._show_all_posts()
        elif event.button.id == "close":
            self.app.pop_screen()
    
    def _show_all_posts(self) -> None:
        results = self.query_one("#results", RichLog)
        results.clear()
        
        results.write("[bold]📚 All Posts in Blockchain[/bold]\n")
        results.write(f"Total blocks: {len(self.app.blockchain)}\n\n")
        
        for block in self.app.blockchain.chain[1:]:  # Skip genesis
            results.write(f"[bold cyan]Block #{block.index}[/bold cyan]")
            results.write(f"  Title: {block.content.title}")
            results.write(f"  Type: {block.content.content_type.value}")
            results.write(f"  Author: {block.author[:30]}...")
            results.write(f"  Hash: {block.hash[:20]}...")
            results.write("")
    
    def _do_search(self) -> None:
        search_key = self.query_one("#search-key", Input).value
        results = self.query_one("#results", RichLog)
        results.clear()
        
        if not search_key:
            results.write("[yellow]Please enter a search key[/yellow]")
            return
        
        # Search by author
        author_blocks = self.app.blockchain.get_blocks_by_author(search_key)
        if author_blocks:
            results.write(f"[bold]Found {len(author_blocks)} posts by this user:[/bold]\n")
            for block in author_blocks:
                results.write(f"[cyan]Block #{block.index}[/cyan]: {block.content.title}")
            return
        
        # Search by content ID
        for block in self.app.blockchain.chain:
            if block.content.id == search_key or block.hash == search_key:
                results.write("[bold green]Found content:[/bold green]\n")
                results.write(block.content.info())
                return
        
        # Search by partial match
        found = False
        for block in self.app.blockchain.chain:
            if (search_key.lower() in block.content.title.lower() or
                search_key.lower() in block.content.description.lower() or
                search_key in block.author):
                if not found:
                    results.write("[bold]Search results:[/bold]\n")
                    found = True
                results.write(f"[cyan]Block #{block.index}[/cyan]: {block.content.title}")
        
        if not found:
            results.write("[yellow]No results found[/yellow]")


class SettingsScreen(Screen):
    """Settings screen for customization"""
    
    BINDINGS = [
        Binding("escape", "cancel", "Cancel"),
    ]
    
    CSS = """
    SettingsScreen {
        align: center middle;
    }
    
    #settings-box {
        width: 80;
        height: auto;
        border: solid yellow;
        padding: 1 2;
    }
    
    .setting-row {
        height: auto;
        margin: 1 0;
    }
    """
    
    def compose(self) -> ComposeResult:
        with Container(id="settings-box"):
            yield Static("⚙️ Settings", classes="title")
            yield Static("")
            
            with Vertical():
                yield Static("[bold]Identity[/bold]")
                yield Static(f"Public Key: {self.app.identity.public_key[:50]}..." if self.app.identity else "No identity")
                
                yield Static("")
                yield Static("[bold]Blockchain[/bold]")
                yield Static(f"Difficulty: {self.app.blockchain.difficulty}")
                yield Static(f"Total Blocks: {len(self.app.blockchain)}")
                
                yield Static("")
                yield Static("[bold]Actions[/bold]")
                
                with Horizontal():
                    yield Button("Export Identity", id="export-identity", variant="primary")
                    yield Button("Show Private Key", id="show-private", variant="warning")
                
                with Horizontal():
                    yield Button("Reset Blockchain", id="reset-blockchain", variant="error")
                    yield Button("Close", id="close", variant="default")
    
    def action_cancel(self) -> None:
        self.app.pop_screen()
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "export-identity":
            self.app.push_screen(ExportIdentityScreen())
        elif event.button.id == "show-private":
            self.app.notify(f"Private Key (keep secret!):\n{self.app.identity.private_key[:100]}...", severity="warning")
        elif event.button.id == "reset-blockchain":
            self.app.blockchain = Blockchain()
            self.app.save_blockchain()
            self.app.notify("Blockchain reset!", severity="information")
            self.app.pop_screen()
        elif event.button.id == "close":
            self.app.pop_screen()


class ExportIdentityScreen(Screen):
    """Screen for exporting identity"""
    
    CSS = """
    ExportIdentityScreen {
        align: center middle;
    }
    
    #export-box {
        width: 80;
        height: 20;
        border: solid green;
        padding: 1 2;
    }
    """
    
    def compose(self) -> ComposeResult:
        with Container(id="export-box"):
            yield Static("📤 Export Identity", classes="title")
            yield Static("")
            yield Label("Password to encrypt:")
            yield Input(id="password", password=True, placeholder="Enter password...")
            yield Label("Confirm Password:")
            yield Input(id="password-confirm", password=True, placeholder="Confirm password...")
            with Horizontal():
                yield Button("Export", id="do-export", variant="success")
                yield Button("Cancel", id="cancel", variant="error")
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        if event.button.id == "do-export":
            password = self.query_one("#password", Input).value
            confirm = self.query_one("#password-confirm", Input).value
            
            if password != confirm:
                self.app.notify("Passwords don't match!", severity="error")
                return
            
            if len(password) < 8:
                self.app.notify("Password must be at least 8 characters!", severity="error")
                return
            
            try:
                encrypted = self.app.identity.export_encrypted(password)
                # Save to file
                export_file = CONFIG_DIR / "identity_backup.txt"
                with open(export_file, "w") as f:
                    f.write(encrypted)
                self.app.notify(f"Identity exported to {export_file}", severity="information")
                self.app.pop_screen()
            except Exception as e:
                self.app.notify(f"Export failed: {e}", severity="error")
                
        elif event.button.id == "cancel":
            self.app.pop_screen()


class RootlessNetApp(App):
    """RootlessNet TUI Application"""
    
    TITLE = "RootlessNet"
    SUB_TITLE = "Decentralized Tor Blockchain Network"
    
    CSS = """
    Screen {
        background: $surface;
    }
    
    #main-container {
        width: 100%;
        height: 100%;
    }
    
    #sidebar {
        width: 30;
        border: solid $primary;
        padding: 1;
    }
    
    #content-area {
        width: 1fr;
        border: solid $secondary;
        padding: 1;
    }
    
    .title {
        text-align: center;
        color: $success;
        text-style: bold;
        margin-bottom: 1;
    }
    
    .menu-button {
        width: 100%;
        margin: 1 0;
    }
    
    #identity-info {
        height: auto;
        border: solid $primary-lighten-2;
        padding: 1;
        margin-bottom: 1;
    }
    
    #blockchain-info {
        height: auto;
        border: solid $secondary-lighten-2;
        padding: 1;
    }
    
    #new-submenu {
        height: auto;
        display: none;
        padding: 1;
        border: solid $success;
    }
    
    #new-submenu.visible {
        display: block;
    }
    """
    
    BINDINGS = [
        Binding("n", "show_new", "New"),
        Binding("v", "show_view", "View"),
        Binding("s", "show_settings", "Settings"),
        Binding("q", "quit", "Quit"),
    ]
    
    def __init__(self):
        super().__init__()
        self.identity: Optional[UserIdentity] = None
        self.blockchain: Blockchain = Blockchain()
        self._load_data()
    
    def _load_data(self) -> None:
        """Load saved identity and blockchain"""
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        
        # Load identity
        if IDENTITY_FILE.exists():
            try:
                with open(IDENTITY_FILE) as f:
                    self.identity = UserIdentity.from_json(f.read())
            except Exception:
                pass
        
        # Load blockchain
        if BLOCKCHAIN_FILE.exists():
            try:
                with open(BLOCKCHAIN_FILE) as f:
                    self.blockchain = Blockchain.from_json(f.read())
            except Exception:
                self.blockchain = Blockchain()
    
    def save_identity(self) -> None:
        """Save identity to file"""
        if self.identity:
            CONFIG_DIR.mkdir(parents=True, exist_ok=True)
            with open(IDENTITY_FILE, "w") as f:
                f.write(self.identity.to_json())
    
    def save_blockchain(self) -> None:
        """Save blockchain to file"""
        CONFIG_DIR.mkdir(parents=True, exist_ok=True)
        with open(BLOCKCHAIN_FILE, "w") as f:
            f.write(self.blockchain.to_json())
    
    def create_new_identity(self) -> None:
        """Create a new identity"""
        self.identity = generate_identity()
        self.save_identity()
        if hasattr(self, '_welcome_shown') and self._welcome_shown:
            self.pop_screen()
        self.notify("New identity created!", severity="information")
        self._update_identity_display()
    
    def _update_identity_display(self) -> None:
        """Update identity display in sidebar"""
        try:
            identity_info = self.query_one("#identity-info", Static)
            if self.identity:
                identity_info.update(
                    f"[bold]🔑 Your Identity[/bold]\n"
                    f"Public Key:\n{self.identity.public_key[:40]}..."
                )
            else:
                identity_info.update("[yellow]No identity loaded[/yellow]")
        except Exception:
            pass
        
        try:
            blockchain_info = self.query_one("#blockchain-info", Static)
            blockchain_info.update(
                f"[bold]⛓️ Blockchain[/bold]\n"
                f"Blocks: {len(self.blockchain)}\n"
                f"Valid: {'✅' if self.blockchain.is_valid() else '❌'}"
            )
        except Exception:
            pass
    
    def compose(self) -> ComposeResult:
        yield Header()
        
        with Horizontal(id="main-container"):
            with Vertical(id="sidebar"):
                yield Static("🌐 [bold]RootlessNet[/bold]", classes="title")
                
                yield Static(
                    f"[bold]🔑 Your Identity[/bold]\n"
                    f"Public Key:\n{self.identity.public_key[:40]}..." if self.identity else "[yellow]No identity[/yellow]",
                    id="identity-info"
                )
                
                yield Static(
                    f"[bold]⛓️ Blockchain[/bold]\n"
                    f"Blocks: {len(self.blockchain)}\n"
                    f"Valid: {'✅' if self.blockchain.is_valid() else '❌'}",
                    id="blockchain-info"
                )
                
                yield Button("🆕 New", id="btn-new", classes="menu-button", variant="success")
                yield Button("👁️ View", id="btn-view", classes="menu-button", variant="primary")
                yield Button("⚙️ Settings", id="btn-settings", classes="menu-button", variant="warning")
                
                with Vertical(id="new-submenu"):
                    yield Static("[bold]Upload:[/bold]")
                    yield Button("📹 Video", id="new-video", variant="default")
                    yield Button("🖼️ Picture", id="new-picture", variant="default")
                    yield Button("📝 Text", id="new-text", variant="default")
                    yield Button("📁 File", id="new-file", variant="default")
            
            with Vertical(id="content-area"):
                yield Static("Welcome to RootlessNet!", classes="title")
                yield Markdown(
                    """
## 🌐 RootlessNet Protocol

A **decentralized Tor blockchain network** for censorship-resistant communication.

### Quick Actions:
- Press **N** or click **New** to upload content
- Press **V** or click **View** to browse content
- Press **S** or click **Settings** to manage your identity

### Features:
- 🔐 **Self-Sovereign Identity** - You own your keys
- 📦 **Decentralized Storage** - Content is stored in blockchain
- 🌍 **Tor Network** - Privacy by default
- ⛓️ **Blockchain Verified** - All content is cryptographically signed

---
*Your data, your rules.*
                    """
                )
        
        yield Footer()
    
    def on_mount(self) -> None:
        """Called when app is mounted"""
        if not self.identity:
            self._welcome_shown = True
            self.push_screen(WelcomeScreen())
    
    def on_button_pressed(self, event: Button.Pressed) -> None:
        button_id = event.button.id
        
        if button_id == "btn-new":
            submenu = self.query_one("#new-submenu")
            submenu.toggle_class("visible")
        
        elif button_id == "btn-view":
            self.push_screen(ViewScreen())
        
        elif button_id == "btn-settings":
            self.push_screen(SettingsScreen())
        
        elif button_id == "new-video":
            self.push_screen(NewContentScreen(ContentType.VIDEO))
        
        elif button_id == "new-picture":
            self.push_screen(NewContentScreen(ContentType.PICTURE))
        
        elif button_id == "new-text":
            self.push_screen(NewContentScreen(ContentType.TEXT))
        
        elif button_id == "new-file":
            self.push_screen(NewContentScreen(ContentType.FILE))
    
    def action_show_new(self) -> None:
        submenu = self.query_one("#new-submenu")
        submenu.toggle_class("visible")
    
    def action_show_view(self) -> None:
        self.push_screen(ViewScreen())
    
    def action_show_settings(self) -> None:
        self.push_screen(SettingsScreen())


def main():
    """Main entry point"""
    app = RootlessNetApp()
    app.run()


if __name__ == "__main__":
    main()
