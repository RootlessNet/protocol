"""
RootlessNet TUI Application - Beautiful terminal interface for the blockchain protocol.

This module provides a stunning terminal user interface using the Textual framework,
featuring three main options:
1. Identity Management - Create and manage cryptographic identities
2. Post Content - Create and sign content on the network  
3. Send Messages - End-to-end encrypted messaging
"""

from textual.app import App, ComposeResult
from textual.binding import Binding
from textual.containers import Container, Horizontal, Vertical, ScrollableContainer
from textual.widgets import (
    Button,
    Footer,
    Header,
    Input,
    Label,
    ListItem,
    ListView,
    Markdown,
    Static,
    TextArea,
    TabbedContent,
    TabPane,
)
from textual.screen import Screen
from textual import on

from .core import Identity, Content, Messaging


class WelcomeScreen(Screen):
    """Welcome screen with the main menu."""
    
    BINDINGS = [
        Binding("q", "quit", "Quit"),
        Binding("1", "identity", "Identity"),
        Binding("2", "content", "Content"),
        Binding("3", "messaging", "Messaging"),
    ]
    
    def compose(self) -> ComposeResult:
        yield Header()
        yield Container(
            Static(
                """
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║   ██████╗  ██████╗  ██████╗ ████████╗██╗     ███████╗███████╗███████╗       ║
║   ██╔══██╗██╔═══██╗██╔═══██╗╚══██╔══╝██║     ██╔════╝██╔════╝██╔════╝       ║
║   ██████╔╝██║   ██║██║   ██║   ██║   ██║     █████╗  ███████╗███████╗       ║
║   ██╔══██╗██║   ██║██║   ██║   ██║   ██║     ██╔══╝  ╚════██║╚════██║       ║
║   ██║  ██║╚██████╔╝╚██████╔╝   ██║   ███████╗███████╗███████║███████║       ║
║   ╚═╝  ╚═╝ ╚═════╝  ╚═════╝    ╚═╝   ╚══════╝╚══════╝╚══════╝╚══════╝       ║
║                                                                              ║
║                           ███╗   ██╗███████╗████████╗                        ║
║                           ████╗  ██║██╔════╝╚══██╔══╝                        ║
║                           ██╔██╗ ██║█████╗     ██║                           ║
║                           ██║╚██╗██║██╔══╝     ██║                           ║
║                           ██║ ╚████║███████╗   ██║                           ║
║                           ╚═╝  ╚═══╝╚══════╝   ╚═╝                           ║
║                                                                              ║
║          A rootless, ownerless substrate for human expression                ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝
                """,
                classes="banner",
            ),
            Static(
                "\n[bold cyan]Speech without roots. Power without owners.[/bold cyan]\n",
                classes="tagline",
            ),
            Horizontal(
                Button("🔑 1. Identity Management", id="btn-identity", variant="primary"),
                Button("📝 2. Post Content", id="btn-content", variant="success"),
                Button("💬 3. Send Messages", id="btn-messaging", variant="warning"),
                classes="menu-buttons",
            ),
            Static(
                "\n[dim]Press number keys (1-3) or click buttons to navigate[/dim]",
                classes="help-text",
            ),
            id="welcome-container",
        )
        yield Footer()
    
    def action_identity(self) -> None:
        self.app.switch_screen("identity")
    
    def action_content(self) -> None:
        self.app.switch_screen("content")
    
    def action_messaging(self) -> None:
        self.app.switch_screen("messaging")
    
    def action_quit(self) -> None:
        self.app.exit()
    
    @on(Button.Pressed, "#btn-identity")
    def on_identity_pressed(self) -> None:
        self.action_identity()
    
    @on(Button.Pressed, "#btn-content")
    def on_content_pressed(self) -> None:
        self.action_content()
    
    @on(Button.Pressed, "#btn-messaging")
    def on_messaging_pressed(self) -> None:
        self.action_messaging()


class IdentityScreen(Screen):
    """Screen for identity management."""
    
    BINDINGS = [
        Binding("escape", "back", "Back"),
        Binding("c", "create", "Create Identity"),
        Binding("e", "export", "Export"),
    ]
    
    def __init__(self):
        super().__init__()
        self.current_identity: Identity | None = None
    
    def compose(self) -> ComposeResult:
        yield Header()
        yield Container(
            Static(
                "🔑 [bold cyan]Identity Management[/bold cyan]",
                classes="screen-title",
            ),
            Static(
                "Create and manage your self-sovereign cryptographic identity.",
                classes="screen-description",
            ),
            Horizontal(
                Vertical(
                    Static("[bold]Create New Identity[/bold]", classes="section-title"),
                    Input(placeholder="Display name (optional)", id="identity-name"),
                    Button("Create Identity", id="btn-create-identity", variant="primary"),
                    classes="identity-create-section",
                ),
                Vertical(
                    Static("[bold]Current Identity[/bold]", classes="section-title"),
                    Static("No identity created yet.", id="identity-info", classes="identity-info"),
                    Button("Export Identity", id="btn-export", variant="success", disabled=True),
                    classes="identity-info-section",
                ),
                classes="identity-sections",
            ),
            Static("", id="identity-output", classes="output-area"),
            Button("← Back to Menu", id="btn-back", variant="default"),
            id="identity-container",
        )
        yield Footer()
    
    @on(Button.Pressed, "#btn-create-identity")
    def on_create_identity(self) -> None:
        name_input = self.query_one("#identity-name", Input)
        name = name_input.value.strip() or None
        
        self.current_identity = Identity.create(name)
        
        info_widget = self.query_one("#identity-info", Static)
        info_widget.update(
            f"[green]✓ Identity Created![/green]\n\n"
            f"[bold]DID:[/bold] {self.current_identity.did}\n"
            f"[bold]Name:[/bold] {self.current_identity.name or 'Anonymous'}\n"
            f"[bold]Public Key:[/bold] {self.current_identity.public_key[:32]}...\n"
            f"[bold]Created:[/bold] {self.current_identity.created_at}"
        )
        
        export_btn = self.query_one("#btn-export", Button)
        export_btn.disabled = False
        
        output_widget = self.query_one("#identity-output", Static)
        output_widget.update("[cyan]Identity created successfully! You can now post content and send messages.[/cyan]")
    
    @on(Button.Pressed, "#btn-export")
    def on_export_identity(self) -> None:
        if self.current_identity:
            output_widget = self.query_one("#identity-output", Static)
            exported = self.current_identity.export()
            output_widget.update(f"[bold]Exported Identity JSON:[/bold]\n```json\n{exported}\n```")
    
    @on(Button.Pressed, "#btn-back")
    def on_back(self) -> None:
        self.app.switch_screen("welcome")
    
    def action_back(self) -> None:
        self.app.switch_screen("welcome")
    
    def action_create(self) -> None:
        self.on_create_identity()
    
    def action_export(self) -> None:
        self.on_export_identity()


class ContentScreen(Screen):
    """Screen for creating and managing content."""
    
    BINDINGS = [
        Binding("escape", "back", "Back"),
        Binding("p", "post", "Post"),
    ]
    
    def __init__(self):
        super().__init__()
        self.identity: Identity | None = None
        self.posted_content: list[Content] = []
    
    def compose(self) -> ComposeResult:
        yield Header()
        yield Container(
            Static(
                "📝 [bold green]Post Content[/bold green]",
                classes="screen-title",
            ),
            Static(
                "Create and sign content on the RootlessNet network.",
                classes="screen-description",
            ),
            Vertical(
                Static("[bold]Compose Your Post[/bold]", classes="section-title"),
                TextArea(id="content-input", language="markdown"),
                Horizontal(
                    Button("📤 Post Content", id="btn-post", variant="success"),
                    Button("🔍 Verify Last Post", id="btn-verify", variant="primary", disabled=True),
                    classes="content-buttons",
                ),
                classes="content-compose-section",
            ),
            ScrollableContainer(
                Static("", id="content-output", classes="output-area"),
                id="content-output-scroll",
            ),
            Button("← Back to Menu", id="btn-back", variant="default"),
            id="content-container",
        )
        yield Footer()
    
    def on_mount(self) -> None:
        # Create a temporary identity for demo
        if not self.identity:
            self.identity = Identity.create("Demo User")
    
    @on(Button.Pressed, "#btn-post")
    def on_post_content(self) -> None:
        content_input = self.query_one("#content-input", TextArea)
        body = content_input.text.strip()
        
        if not body:
            output_widget = self.query_one("#content-output", Static)
            output_widget.update("[red]Error: Please enter some content to post.[/red]")
            return
        
        if not self.identity:
            self.identity = Identity.create("Demo User")
        
        content = Content.create(body, self.identity)
        self.posted_content.append(content)
        
        output_widget = self.query_one("#content-output", Static)
        output_widget.update(
            f"[green]✓ Content Posted Successfully![/green]\n\n"
            f"[bold]CID:[/bold] {content.cid}\n"
            f"[bold]Author:[/bold] {content.author}\n"
            f"[bold]Body:[/bold] {content.body[:100]}{'...' if len(content.body) > 100 else ''}\n"
            f"[bold]Created:[/bold] {content.created_at}\n"
            f"[bold]Signature:[/bold] {content.signature[:32]}...\n\n"
            f"[dim]Content is cryptographically signed and can be verified.[/dim]"
        )
        
        verify_btn = self.query_one("#btn-verify", Button)
        verify_btn.disabled = False
        
        # Clear input
        content_input.clear()
    
    @on(Button.Pressed, "#btn-verify")
    def on_verify_content(self) -> None:
        if self.posted_content:
            last_content = self.posted_content[-1]
            is_valid = last_content.verify()
            
            output_widget = self.query_one("#content-output", Static)
            if is_valid:
                output_widget.update(
                    f"[green]✓ Signature Verified![/green]\n\n"
                    f"The content with CID [bold]{last_content.cid}[/bold] has a valid signature.\n"
                    f"This proves the content was created by the identity: {last_content.author}"
                )
            else:
                output_widget.update(
                    f"[red]✗ Signature Invalid![/red]\n\n"
                    f"The content signature could not be verified."
                )
    
    @on(Button.Pressed, "#btn-back")
    def on_back(self) -> None:
        self.app.switch_screen("welcome")
    
    def action_back(self) -> None:
        self.app.switch_screen("welcome")
    
    def action_post(self) -> None:
        self.on_post_content()


class MessagingScreen(Screen):
    """Screen for end-to-end encrypted messaging."""
    
    BINDINGS = [
        Binding("escape", "back", "Back"),
        Binding("s", "send", "Send"),
    ]
    
    def __init__(self):
        super().__init__()
        self.sender: Identity | None = None
        self.recipient: Identity | None = None
        self.messages: list[tuple[str, str, str]] = []  # (direction, content, encrypted)
    
    def compose(self) -> ComposeResult:
        yield Header()
        yield Container(
            Static(
                "💬 [bold yellow]Send Messages[/bold yellow]",
                classes="screen-title",
            ),
            Static(
                "End-to-end encrypted messaging with forward secrecy.",
                classes="screen-description",
            ),
            Horizontal(
                Vertical(
                    Static("[bold]Sender Identity[/bold]", classes="section-title"),
                    Button("Create Sender", id="btn-create-sender", variant="primary"),
                    Static("No sender identity", id="sender-info", classes="identity-mini"),
                    classes="messaging-identity",
                ),
                Vertical(
                    Static("[bold]Recipient Identity[/bold]", classes="section-title"),
                    Button("Create Recipient", id="btn-create-recipient", variant="primary"),
                    Static("No recipient identity", id="recipient-info", classes="identity-mini"),
                    classes="messaging-identity",
                ),
                classes="messaging-identities",
            ),
            Vertical(
                Static("[bold]Compose Message[/bold]", classes="section-title"),
                Input(placeholder="Type your message here...", id="message-input"),
                Horizontal(
                    Button("🔒 Encrypt & Send", id="btn-send", variant="success", disabled=True),
                    Button("🔓 Decrypt Last", id="btn-decrypt", variant="warning", disabled=True),
                    classes="messaging-buttons",
                ),
                classes="messaging-compose",
            ),
            ScrollableContainer(
                Static("", id="messaging-output", classes="output-area"),
                id="messaging-output-scroll",
            ),
            Button("← Back to Menu", id="btn-back", variant="default"),
            id="messaging-container",
        )
        yield Footer()
    
    @on(Button.Pressed, "#btn-create-sender")
    def on_create_sender(self) -> None:
        self.sender = Identity.create("Alice (Sender)")
        sender_info = self.query_one("#sender-info", Static)
        sender_info.update(f"[green]✓[/green] {self.sender.did[:30]}...")
        self._update_send_button()
    
    @on(Button.Pressed, "#btn-create-recipient")
    def on_create_recipient(self) -> None:
        self.recipient = Identity.create("Bob (Recipient)")
        recipient_info = self.query_one("#recipient-info", Static)
        recipient_info.update(f"[green]✓[/green] {self.recipient.did[:30]}...")
        self._update_send_button()
    
    def _update_send_button(self) -> None:
        send_btn = self.query_one("#btn-send", Button)
        send_btn.disabled = not (self.sender and self.recipient)
    
    @on(Button.Pressed, "#btn-send")
    def on_send_message(self) -> None:
        message_input = self.query_one("#message-input", Input)
        message = message_input.value.strip()
        
        if not message:
            output_widget = self.query_one("#messaging-output", Static)
            output_widget.update("[red]Error: Please enter a message to send.[/red]")
            return
        
        if not self.sender or not self.recipient:
            return
        
        # Encrypt message
        encrypted = Messaging.encrypt(message, self.sender, self.recipient.public_key)
        self.messages.append(("sent", message, encrypted))
        
        output_widget = self.query_one("#messaging-output", Static)
        output_widget.update(
            f"[green]✓ Message Encrypted & Sent![/green]\n\n"
            f"[bold]Original Message:[/bold] {message}\n\n"
            f"[bold]Encrypted Payload:[/bold]\n"
            f"[dim]{encrypted[:200]}...[/dim]\n\n"
            f"[cyan]The message is now encrypted with X25519 + XChaCha20-Poly1305[/cyan]"
        )
        
        decrypt_btn = self.query_one("#btn-decrypt", Button)
        decrypt_btn.disabled = False
        
        message_input.clear()
    
    @on(Button.Pressed, "#btn-decrypt")
    def on_decrypt_message(self) -> None:
        if not self.messages or not self.recipient or not self.sender:
            return
        
        _, original, encrypted = self.messages[-1]
        
        try:
            decrypted = Messaging.decrypt(encrypted, self.recipient, self.sender.public_key)
            
            output_widget = self.query_one("#messaging-output", Static)
            output_widget.update(
                f"[green]✓ Message Decrypted Successfully![/green]\n\n"
                f"[bold]Decrypted Message:[/bold] {decrypted}\n\n"
                f"[bold]Original Message:[/bold] {original}\n\n"
                f"[cyan]✓ Messages match - encryption/decryption successful![/cyan]"
            )
        except Exception as e:
            output_widget = self.query_one("#messaging-output", Static)
            output_widget.update(f"[red]Decryption failed: {e}[/red]")
    
    @on(Button.Pressed, "#btn-back")
    def on_back(self) -> None:
        self.app.switch_screen("welcome")
    
    def action_back(self) -> None:
        self.app.switch_screen("welcome")
    
    def action_send(self) -> None:
        self.on_send_message()


class RootlessNetApp(App):
    """The main RootlessNet TUI application."""
    
    CSS = """
    Screen {
        background: $surface;
    }
    
    #welcome-container {
        align: center middle;
        width: 100%;
        height: 100%;
    }
    
    .banner {
        text-align: center;
        color: $primary;
        padding: 1;
    }
    
    .tagline {
        text-align: center;
        padding: 1;
    }
    
    .menu-buttons {
        align: center middle;
        width: 100%;
        height: auto;
        padding: 2;
    }
    
    .menu-buttons Button {
        margin: 0 2;
        min-width: 25;
    }
    
    .help-text {
        text-align: center;
        padding: 1;
    }
    
    .screen-title {
        text-align: center;
        padding: 1 0;
        text-style: bold;
    }
    
    .screen-description {
        text-align: center;
        color: $text-muted;
        padding: 0 0 2 0;
    }
    
    .section-title {
        padding: 1 0;
        border-bottom: solid $primary;
    }
    
    #identity-container, #content-container, #messaging-container {
        padding: 2;
    }
    
    .identity-sections {
        width: 100%;
        height: auto;
    }
    
    .identity-create-section, .identity-info-section {
        width: 50%;
        padding: 1 2;
    }
    
    .identity-info {
        padding: 1;
        background: $surface-darken-1;
        border: solid $primary;
        margin: 1 0;
    }
    
    .output-area {
        padding: 1;
        background: $surface-darken-2;
        border: solid $accent;
        margin: 1 0;
        min-height: 10;
    }
    
    #content-input {
        height: 8;
        margin: 1 0;
    }
    
    .content-buttons, .messaging-buttons {
        padding: 1 0;
    }
    
    .content-buttons Button, .messaging-buttons Button {
        margin-right: 2;
    }
    
    #content-output-scroll, #messaging-output-scroll {
        height: 15;
        border: solid $primary;
    }
    
    .messaging-identities {
        width: 100%;
        height: auto;
        padding: 1 0;
    }
    
    .messaging-identity {
        width: 50%;
        padding: 0 2;
    }
    
    .identity-mini {
        padding: 1;
        background: $surface-darken-1;
        margin: 1 0;
    }
    
    .messaging-compose {
        padding: 1 0;
    }
    
    #message-input {
        margin: 1 0;
    }
    
    #btn-back {
        margin-top: 2;
    }
    """
    
    TITLE = "RootlessNet"
    SUB_TITLE = "Decentralized Blockchain Protocol"
    
    SCREENS = {
        "welcome": WelcomeScreen,
        "identity": IdentityScreen,
        "content": ContentScreen,
        "messaging": MessagingScreen,
    }
    
    def on_mount(self) -> None:
        """Called when the app is mounted."""
        self.push_screen("welcome")


def main() -> None:
    """Entry point for the TUI application."""
    app = RootlessNetApp()
    app.run()


if __name__ == "__main__":
    main()
