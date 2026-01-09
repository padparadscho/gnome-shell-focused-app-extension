import Clutter from "gi://Clutter";
import GObject from "gi://GObject";
import Gio from "gi://Gio";
import Shell from "gi://Shell";
import St from "gi://St";
import * as Main from "resource:///org/gnome/shell/ui/main.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";
import * as Util from "resource:///org/gnome/shell/misc/util.js";

import {
  Extension,
  gettext as _,
} from "resource:///org/gnome/shell/extensions/extension.js";

const FocusedAppIndicator = GObject.registerClass(
  class FocusedAppIndicator extends PanelMenu.Button {
    /**
     * Initialize the indicator.
     * @param {Extension} extension - The extension instance.
     */
    _init(extension) {
      super._init(0.5, _("Focused App Extension"), false);

      this._extension = extension;
      this._settings = extension.getSettings();

      // Extension Layout
      this._box = new St.BoxLayout({
        style_class: "focused-app-box",
        vertical: false,
        x_expand: true,
        y_expand: false,
        y_align: Clutter.ActorAlign.CENTER,
      });
      this.add_child(this._box);

      this._icon = new St.Icon({
        style_class: "focused-app-icon",
        y_align: Clutter.ActorAlign.CENTER,
      });
      this._box.add_child(this._icon);

      this._label = new St.Label({
        style_class: "focused-app-label",
        y_align: Clutter.ActorAlign.CENTER,
      });
      this._box.add_child(this._label);

      // Menu Items
      this._buildMenu();

      // Signals
      this._settingsSignals = [];
      this._settingsSignals.push(
        this._settings.connect("changed::enable-focused-app-title", () =>
          this._update()
        )
      );
      this._settingsSignals.push(
        this._settings.connect("changed::enable-focused-app-icon", () =>
          this._update()
        )
      );
      this._settingsSignals.push(
        this._settings.connect("changed::enable-monochrome-icon", () =>
          this._update()
        )
      );
      this._settingsSignals.push(
        this._settings.connect("changed::enable-fixed-title-width", () =>
          this._update()
        )
      );
      this._settingsSignals.push(
        this._settings.connect("changed::enable-move-to-workspace", () =>
          this._buildMenu()
        )
      );
      this._settingsSignals.push(
        this._settings.connect("changed::enable-take-screenshot", () =>
          this._buildMenu()
        )
      );
      this._settingsSignals.push(
        this._settings.connect("changed::enable-app-settings", () =>
          this._buildMenu()
        )
      );
      this._settingsSignals.push(
        this._settings.connect("changed::focused-app-icon-size", () =>
          this._updateLayout()
        )
      );
      this._settingsSignals.push(
        this._settings.connect("changed::focused-app-title-width", () =>
          this._update()
        )
      );

      this._tracker = Shell.WindowTracker.get_default();

      this._focusSignal = global.display.connect("notify::focus-window", () =>
        this._onFocusChanged()
      );
      this._overviewShowingSignal = Main.overview.connect("showing", () =>
        this.hide()
      );
      this._overviewHidingSignal = Main.overview.connect("hidden", () =>
        this._onFocusChanged()
      );

      this._currentWindow = null;
      this._currentWindowSignal = null;

      // Initial update
      this._updateLayout();
      this._onFocusChanged();
    }

    // Build menu items
    _buildMenu() {
      this.menu.removeAll();

      // Minimize
      this._minimizeItem = new PopupMenu.PopupMenuItem(_("Minimize"));
      this._minimizeItem.connect("activate", () => {
        const window = global.display.focus_window;
        if (window) window.minimize();
      });
      this.menu.addMenuItem(this._minimizeItem);

      // Move to New Workspace
      if (this._settings.get_boolean("enable-move-to-workspace")) {
        this._moveToWorkspaceItem = new PopupMenu.PopupMenuItem(
          _("Move to New Workspace")
        );
        this._moveToWorkspaceItem.connect("activate", () => {
          const window = global.display.focus_window;
          if (window) {
            const workspaceManager = global.workspace_manager;
            // Append a new workspace (false = don't switch to it yet, 0 = timestamp)
            workspaceManager.append_new_workspace(false, 0);

            const newWorkspaceIndex = workspaceManager.n_workspaces - 1;
            const newWorkspace =
              workspaceManager.get_workspace_by_index(newWorkspaceIndex);

            if (newWorkspace) {
              window.change_workspace(newWorkspace);
              if (this._settings.get_boolean("enable-follow-to-workspace")) {
                newWorkspace.activate(global.get_current_time());
              }
            }
          }
        });
        this.menu.addMenuItem(this._moveToWorkspaceItem);
      }

      // Take Screenshot
      if (this._settings.get_boolean("enable-take-screenshot")) {
        this._screenshotItem = new PopupMenu.PopupMenuItem(
          _("Take Screenshot")
        );
        this._screenshotItem.connect("activate", () => {
          Main.screenshotUI.open();
        });
        this.menu.addMenuItem(this._screenshotItem);
      }

      // App Settings
      if (this._settings.get_boolean("enable-app-settings")) {
        this._appSettingsItem = new PopupMenu.PopupMenuItem(_("App Settings"));
        this._appSettingsItem.connect("activate", () => {
          const window = global.display.focus_window;
          if (window) {
            const app = this._tracker.get_window_app(window);
            if (app) {
              const appId = app.get_id();
              Util.spawn(["gnome-control-center", "applications", appId]);
            }
          }
        });
        this.menu.addMenuItem(this._appSettingsItem);
      }

      // Close
      this._closeItem = new PopupMenu.PopupMenuItem(_("Close"));
      this._closeItem.connect("activate", () => {
        const window = global.display.focus_window;
        if (window) window.delete(global.get_current_time());
      });
      this.menu.addMenuItem(this._closeItem);
    }

    // Update layout dimensions
    _updateLayout() {
      const iconSize = this._settings.get_int("focused-app-icon-size");
      this._icon.set_icon_size(iconSize);
      this._update();
    }

    // Handle focus changes
    _onFocusChanged() {
      if (Main.overview.visible) {
        this.hide();
        return;
      }

      const window = global.display.focus_window;

      if (this._currentWindow) {
        if (this._currentWindowSignal) {
          this._currentWindow.disconnect(this._currentWindowSignal);
          this._currentWindowSignal = null;
        }
        this._currentWindow = null;
      }

      if (!window) {
        this.hide();
        return;
      }

      this._currentWindow = window;
      this._currentWindowSignal = window.connect("notify::title", () =>
        this._update()
      );

      this.show();
      this._update();
    }

    // Update widget content
    _update() {
      const window = global.display.focus_window;
      if (!window) return;

      const app = this._tracker.get_window_app(window);

      // Icon
      if (this._settings.get_boolean("enable-focused-app-icon")) {
        this._icon.show();
        if (app) {
          let icon = app.get_icon();
          const useMonochrome = this._settings.get_boolean(
            "enable-monochrome-icon"
          );

          if (useMonochrome) {
            // Attempt to use symbolic icon
            if (icon instanceof Gio.ThemedIcon) {
              const names = icon.get_names();
              const symbolicNames = [];
              for (const name of names) {
                if (!name.endsWith("-symbolic")) {
                  symbolicNames.push(name + "-symbolic");
                }
              }
              symbolicNames.push(...names);
              icon = new Gio.ThemedIcon({ names: symbolicNames });
            }

            // Apply Desaturate Effect
            if (!this._desaturateEffect) {
              this._desaturateEffect = new Clutter.DesaturateEffect();
              this._icon.add_effect(this._desaturateEffect);
            }
            this._desaturateEffect.enabled = true;
          } else {
            // Disable Desaturate Effect
            if (this._desaturateEffect) {
              this._desaturateEffect.enabled = false;
            }
          }

          this._icon.gicon = icon;
        } else {
          this._icon.gicon = null;
        }
      } else {
        this._icon.hide();
      }

      // Title
      if (this._settings.get_boolean("enable-focused-app-title")) {
        this._label.show();

        let titleText = "";
        const showAppNameOnly = this._settings.get_boolean(
          "enable-fixed-title-width"
        );

        if (showAppNameOnly && app) {
          titleText = app.get_name();
        } else {
          titleText = window.get_title();
        }

        // Ellipsization logic
        const maxWidthChars = this._settings.get_int("focused-app-title-width");
        if (titleText && titleText.length > maxWidthChars) {
          const keep = Math.floor((maxWidthChars - 3) / 2);
          titleText =
            titleText.substring(0, keep) +
            "..." +
            titleText.substring(titleText.length - keep);
        }

        this._label.set_text(titleText || "");
      } else {
        this._label.hide();
      }
    }

    // Clean up signals and destroy the widget
    destroy() {
      if (this._focusSignal) {
        global.display.disconnect(this._focusSignal);
        this._focusSignal = null;
      }
      if (this._overviewShowingSignal) {
        Main.overview.disconnect(this._overviewShowingSignal);
        this._overviewShowingSignal = null;
      }
      if (this._overviewHidingSignal) {
        Main.overview.disconnect(this._overviewHidingSignal);
        this._overviewHidingSignal = null;
      }
      if (this._currentWindow && this._currentWindowSignal) {
        this._currentWindow.disconnect(this._currentWindowSignal);
        this._currentWindow = null;
      }
      if (this._settingsSignals) {
        this._settingsSignals.forEach((id) => this._settings.disconnect(id));
        this._settingsSignals = [];
      }

      super.destroy();
    }
  }
);

export default class FocusedAppExtension extends Extension {
  // Enable the extension
  enable() {
    this._indicator = new FocusedAppIndicator(this);
    Main.panel.addToStatusArea(
      "focused-app-indicator",
      this._indicator,
      1,
      "left"
    );
  }

  // Disable the extension
  disable() {
    if (this._indicator) {
      this._indicator.destroy();
      this._indicator = null;
    }
  }
}
