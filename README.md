![](https://github.com/MarciiTheDev/MarcRoPresent/blob/main/assets/MarcRoPresent.ico)
# MarcRoPresent
A simple Roblox Discord Rich Presence

## Installation
In order to install MarcRoPresent, you would need to download it's [latest release](https://github.com/MarciiTheDev/MarcRoPresent/releases/latest).

Those are the following supported Versions, please download the one compatible with your OS:
* `MarcRoPresent-linux` (For Linux)
* `MarcRoPresent-macos` (For MacOS)
* `MarcRoPresent-win`  (For Windows)

Create a new `directory`and move the downloaded file into it.

Create a new file called: `config.json` within the same `directory`.

Within that file, you can configure how MarcRoPresent should display your Status.
Here is the default `config.json` template:
```json
{
  "player"             : true,
  "studio"             : true,
  "website"            : true,
  "roblosecurityToken" : "<Token>"
}
```
After editing, you may save the file and run it.

## Configuration

`player` => Whether it should display activity when playing a Roblox Game or not. (`true` or `false`)<br>
`studio` => Whether it should display activity when editing a Roblox Game within Studio. (`true` or `false`)<br>
`website` => Whether it should display activity when browsing the Roblox Website or not. (`true` or `false`)<br>
`roblosecurityToken` => Your `.ROBLOSECURITY` Cookie. (`.ROBLOSECURITY`)

## .ROBLOSECURITY
MarcRoPresent does need access to your `.ROBLOSECURITY`-Cookie in order to display more details about your activity (egg. Game Name Editing/Playing)

You can optrain your `.ROBLOSECURITY`-Cookie by:
 1. Visiting Roblox's Website
 2. Clicking Right Click -> Inspect Element(s)
 3. Going to `Application` -> `Cookies`
 4. Searching for the Cookie called: `.ROBLOSECURITY` and copying it's value

MarcRoPresent **__DOES NOT__** use your Cookie in any malicious ways. If you don't trust MarcRoPresent with your Cookie, you are free to look through the code MarcRoPresent provides, to see if it's really getting used for anything malicious. - MarcRoPresent is open-source, and it will always stay like that.
