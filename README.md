# GNOME Shell Focused App Extension

A GNOME Shell extension that displays the icon and title of the currently focused application in the top bar, providing a native-looking widget with interactive window management actions.

## Features

- Display of the currently focused window's icon and title in the top bar.
- Automatic hiding when entering the Overview or when no window is focused.
- Interactive indicator to access quick actions:
  - **Minimize**: Minimize the focused window.
  - **Move to New Workspace**: Moves the focused window to a new workspace (configurable to follow focus).
  - **Take Screenshot**: Captures the focused window using the native GNOME Shell UI or `gnome-screenshot`.
  - **App Settings**: Opens the focused application's page in GNOME Control Center.
  - **Close**: Closes the focused window.
- Customizable display with options to toggle icon or title visibility, show app name only (e.g., "Firefox" instead of full window title), and configure icon size and title width with middle-ellipsization.

## Installation

1. Clone the repository:

```bash
git clone https://github.com/padparadscho/gnome-shell-focused-app-extension.git
cd gnome-shell-focused-app-extension
```

## Usage

1. Compile the GSettings schema:

```bash
glib-compile-schemas schemas/
```

2. Install the extension:

```bash
# Ensure the directory exists
mkdir -p ~/.local/share/gnome-shell/extensions/focused-app-extension@padparadscho.com

# Copy extension files
cp -r * ~/.local/share/gnome-shell/extensions/focused-app-extension@padparadscho.com/
```

3. Restart GNOME Shell (`Alt`+`F2`, type `r`, `Enter` on X11, or logout/login on Wayland).

4. Enable the extension using the **Extensions** app or CLI:

```bash
gnome-extensions enable focused-app-extension@padparadscho.com
```

## Contributing

If you're interested in helping improve the `gnome-shell-focused-app-extension` project, please see the [CONTRIBUTING](/CONTRIBUTING.md) file for guidelines on how to get started.

## License

This project is licensed under the [MIT License](/LICENSE).
