import Adw from "gi://Adw";
import Gio from "gi://Gio";
import Gtk from "gi://Gtk";

import {
  ExtensionPreferences,
  gettext as _,
} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class FocusedAppExtensionPreferences extends ExtensionPreferences {
  /**
   * Fill the preferences window with settings groups and rows.
   * @param {Adw.PreferencesWindow} window - The preferences window to populate.
   */
  fillPreferencesWindow(window) {
    const settings = this.getSettings();

    const page = new Adw.PreferencesPage();
    window.add(page);

    // Content Group
    const contentGroup = new Adw.PreferencesGroup({
      title: _("Content"),
      description: _("Configure what information to display"),
    });
    page.add(contentGroup);

    const focusedAppTitleRow = new Adw.SwitchRow({
      title: _("Enable Focused App Title"),
      subtitle: _("Display the application title"),
    });
    contentGroup.add(focusedAppTitleRow);
    settings.bind(
      "enable-focused-app-title",
      focusedAppTitleRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT
    );

    const focusedAppIconRow = new Adw.SwitchRow({
      title: _("Enable Focused App Icon"),
      subtitle: _("Display the application icon"),
    });
    contentGroup.add(focusedAppIconRow);
    settings.bind(
      "enable-focused-app-icon",
      focusedAppIconRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT
    );

    const monochromeIconRow = new Adw.SwitchRow({
      title: _("Enable Monochrome Icons"),
      subtitle: _("Show a desaturated or symbolic version of the app icon"),
    });
    contentGroup.add(monochromeIconRow);
    settings.bind(
      "enable-monochrome-icon",
      monochromeIconRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT
    );

    const focusedAppNameRow = new Adw.SwitchRow({
      title: _("Enable App Name Only"),
      subtitle: _('Show "Firefox" instead of the full window title'),
    });
    contentGroup.add(focusedAppNameRow);
    settings.bind(
      "enable-fixed-title-width",
      focusedAppNameRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT
    );

    // Layout Group
    const layoutGroup = new Adw.PreferencesGroup({
      title: _("Layout"),
      description: _("Adjust sizes and dimensions"),
    });
    page.add(layoutGroup);

    const focusedAppIconSizeRow = new Adw.SpinRow({
      title: _("Focused App Icon Size"),
      subtitle: _("Size of the application icon in pixels"),
      adjustment: new Gtk.Adjustment({
        lower: 8,
        upper: 64,
        step_increment: 1,
      }),
    });
    layoutGroup.add(focusedAppIconSizeRow);
    settings.bind(
      "focused-app-icon-size",
      focusedAppIconSizeRow,
      "value",
      Gio.SettingsBindFlags.DEFAULT
    );

    const focusedAppTitleWidthRow = new Adw.SpinRow({
      title: _("Focused App Title Width"),
      subtitle: _("Maximum width of the title in characters"),
      adjustment: new Gtk.Adjustment({
        lower: 5,
        upper: 100,
        step_increment: 1,
      }),
    });
    layoutGroup.add(focusedAppTitleWidthRow);
    settings.bind(
      "focused-app-title-width",
      focusedAppTitleWidthRow,
      "value",
      Gio.SettingsBindFlags.DEFAULT
    );

    // Actions Group
    const actionsGroup = new Adw.PreferencesGroup({
      title: _("Actions"),
      description: _("Configure menu actions"),
    });
    page.add(actionsGroup);

    const moveToWorkspaceRow = new Adw.SwitchRow({
      title: _("Enable Move to Workspace"),
      subtitle: _("Show option to move window to a new workspace"),
    });
    actionsGroup.add(moveToWorkspaceRow);
    settings.bind(
      "enable-move-to-workspace",
      moveToWorkspaceRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT
    );

    const followToWorkspaceRow = new Adw.SwitchRow({
      title: _("Enable Follow to Workspace"),
      subtitle: _("Switch to the new workspace when moving a window"),
    });
    actionsGroup.add(followToWorkspaceRow);
    settings.bind(
      "enable-follow-to-workspace",
      followToWorkspaceRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT
    );

    const takeScreenshotRow = new Adw.SwitchRow({
      title: _("Enable Take Screenshot"),
      subtitle: _("Show option to take a screenshot of the window"),
    });
    actionsGroup.add(takeScreenshotRow);
    settings.bind(
      "enable-take-screenshot",
      takeScreenshotRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT
    );

    const appSettingsRow = new Adw.SwitchRow({
      title: _("Enable App Settings"),
      subtitle: _("Show option to open application settings"),
    });
    actionsGroup.add(appSettingsRow);
    settings.bind(
      "enable-app-settings",
      appSettingsRow,
      "active",
      Gio.SettingsBindFlags.DEFAULT
    );
  }
}
