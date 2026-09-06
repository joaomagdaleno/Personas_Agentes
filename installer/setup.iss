; ==============================================================================
; 🏛️ Personas & Agentes (PSA) — Script de Compilação Inno Setup (Windows x64)
; ==============================================================================
; Para compilar: ISCC.exe .\installer\setup.iss
; ==============================================================================

#define MyAppName "Personas & Agentes"
#define MyAppVersion "2.0.0"
#define MyAppPublisher "Sovereign Engineering"
#define MyAppURL "https://github.com/joaomagdaleno/Personas_Agentes"
#define MyAppExeName "PersonasAgentes.WinUI.exe"

[Setup]
AppId={{C6F5A3E2-819A-4E3D-B937-2E89D7F91512}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\PersonasAgentes
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
OutputDir=..\dist-installer
OutputBaseFilename=PersonasAgentes-Setup-v2.0
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64compatible
ArchitecturesAllowed=x64compatible
PrivilegesRequired=lowest
DisableProgramGroupPage=yes

[Languages]
Name: "brazilianportuguese"; MessagesFile: "compiler:Languages\BrazilianPortuguese.isl"
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked
Name: "addtopath"; Description: "Adicionar binários (personas-engine) ao PATH do sistema"; GroupDescription: "Configurações Avançadas:"

[Dirs]
Name: "{app}\models"; Permissions: users-modify
Name: "{app}\data"; Permissions: users-modify
Name: "{app}\sessions"; Permissions: users-modify

[Files]
Source: "..\dist\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Icons]
Name: "{group}\PSA Agent Workbench"; Filename: "{app}\winui\{#MyAppExeName}"; WorkingDir: "{app}\winui"
Name: "{group}\Desinstalar {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\PSA Agent Workbench"; Filename: "{app}\winui\{#MyAppExeName}"; WorkingDir: "{app}\winui"; Tasks: desktopicon

[Registry]
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}\bin"; Tasks: addtopath; Check: NeedsAddPath(ExpandConstant('{app}\bin'))

[Run]
Filename: "{app}\bin\model-downloader.exe"; Parameters: "--model 1.5b --auto-close 3 --dir ""{app}\models"""; Description: "Baixar modelo rápido de IA agora (Qwen 2.5 1.5B ~1.0 GB)"; Flags: postinstall skipifsilent; Check: not Model15bExists
Filename: "{app}\bin\model-downloader.exe"; Parameters: "--dir ""{app}\models"""; Description: "Abrir Gerenciador de Modelos (para baixar Qwen 3 Thinking / Qwen 7B)"; Flags: postinstall unchecked skipifsilent
Filename: "{app}\winui\{#MyAppExeName}"; Description: "{cm:LaunchProgram,PSA Agent Workbench}"; WorkingDir: "{app}\winui"; Flags: nowait postinstall skipifsilent

[Code]
function NeedsAddPath(Param: string): boolean;
var
  OrigPath: string;
begin
  if not RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', OrigPath)
  then begin
    Result := True;
    exit;
  end;
  Result := Pos(';' + UpperCase(Param) + ';', ';' + UpperCase(OrigPath) + ';') = 0;
end;

function Model15bExists: boolean;
begin
  Result := FileExists(ExpandConstant('{app}\models\qwen2.5-coder-1.5b-instruct-q4_k_m.gguf'));
end;
