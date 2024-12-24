# Steam License Cleanup Button

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Tampermonkey](https://img.shields.io/badge/compatible-Tampermonkey-brightgreen)
![Greasemonkey](https://img.shields.io/badge/compatible-Greasemonkey-brightgreen)

This script adds a button to the Steam account licenses page to remove licenses related to trailers, teasers, demos, cinematics, PEGI, ESRB, or soundtracks. It provides a popup summary of removed licenses and an option to refresh the page. It also allows customization of keywords for filtering licenses.

## Features

- Removes licenses for trailers, teasers, demos, cinematics, PEGI, ESRB, and soundtracks.
- Provides a summary of removed licenses.
- Option to refresh the page after cleanup.
- Customizable keywords for filtering licenses.
- Handles rate limits and retries automatically.
- Displays a progress bar during cleanup, including rate limit status.

## Installation

1. Install a userscript manager like [Tampermonkey](https://www.tampermonkey.net/) or [Greasemonkey](https://www.greasespot.net/).
2. [Install the script](https://github.com/PatrickJnr/Steam-License-Cleanup/raw/main/Steam-License-Cleanup.user.js) using your userscript manager.

## How to Use

1. Navigate to the [Steam account licenses page](https://store.steampowered.com/account/licenses/).
2. Click the "Clean Up Licenses" button that appears on the page.
3. Confirm the removal of licenses in the popup dialog.
4. Optionally, click the "Settings" button to customize the keywords for filtering licenses.

## Troubleshooting

### The script is not removing licenses

- Ensure you are logged into your Steam account.
- Make sure you have the latest version of the script installed.
- Check the browser console for any error messages.
- If you encounter rate limits, the script will automatically retry after a delay.

## FAQ

### How does the script identify licenses to remove?

The script uses a list of keywords (e.g., trailer, teaser, demo, cinematic, PEGI, ESRB, soundtrack) to identify licenses. You can customize these keywords in the settings.

### What happens if I encounter a rate limit?

If you encounter a rate limit, the script will automatically retry after a delay of 60 seconds. The progress bar will indicate the rate limit status.

### Can I customize the keywords for filtering licenses?

Yes, you can customize the keywords by clicking the "Settings" button and updating the list of keywords.

## Contributing

Contributions are welcome! If you have suggestions for improvements or new features, feel free to open an issue or submit a pull request on [GitHub](https://github.com/PatrickJnr/Steam-License-Cleanup).

## Credits

- @retvil
- @TCNOco
