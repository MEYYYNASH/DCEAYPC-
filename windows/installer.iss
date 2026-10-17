#define MyAppName "DCEAY Music App"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "DCEAY"
#define MyAppExeName "DCEAY Music App.exe"

[Setup]
AppId={{9F82A45B-3B3D-4D2B-8E7C-9E4F0123DCE1}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=..\dist-windows
OutputBaseFilename=DCEAY-Music-App-Setup
Compression=lzma2/ultra64
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=lowest
DisableProgramGroupPage=yes

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"

[Files]
Source: "..\dist-windows\{#MyAppExeName}"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\dist-windows\DCEAY Music App.dll"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\dist-windows\DCEAY Music App.deps.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\dist-windows\DCEAY Music App.runtimeconfig.json"; DestDir: "{app}"; Flags: ignoreversion
Source: "..\dist-windows\www\*"; DestDir: "{app}\www"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#StringChange(MyAppName, '&', '&&')}}"; Flags: nowait postinstall skipifsilent
