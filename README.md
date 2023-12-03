# US Visa Bot
Bot created with NodeJS and Puppeteer to check the US visa page for available Visa and ASC Appointment spots and book them for you!

## Steps to run the bot

- Have an appointment already booked through the visa page (so the bot can compare against it)
- Create a `.env` file with the required information (see `.env.template` and `.env.example`)
- `$ npm install`
- `$ npm install pm2 -g`
- `$ pm2 start index.js` [^1]

That's it! The bot is going to check the page every 5 minutes and try to get you an earlier appointment.
Also you can set it up to send you an email alert or push notification when a spot is available!

[^1]: Additional Commands
  `$ pm2 stop 0` to stop the program
  `$ pm2 monit` to visualise the current output logs
  `$ pm2 status` to view whether the program is running

## Usage Recommendations

- `Have ffmpeg already installed`

  As will be stated below the program can record the browser page itself for later review. It uses ffmpeg to achieve this, and while it can automatically install ffmpeg if it is not present on your pc, you can save yourself any installation hassles by having [ffmpeg](https://ffmpeg.org/) already installed and providing the path to the executable in `./index.js` at `ffmpeg_Path: `.

- `Use a VPN to cycle IPs`

  The visa page tends to block your IP after a while, and then you will have to wait up to 4 hours before you can enter again, that's why changing your IP through a VPN **every half hour** or so is a good idea. If you don't already have one you can install multiple free VPNs and use each one till the limited free data plan runs out: [PrivadoVPN](https://privadovpn.com/es/), [Windscribe](https://windscribe.com/), [ProtonVPN](https://protonvpn.com/) (this one has unlimited data but with a slight caveat, it gets bot flagged very quickly so you must change IPs every 5 minutes).
- `Use an auto clicker to cycle IPs in the VPN apps`

  You don't want to be manually changing IPs all the time, so get another bot to do it for you! Personally I used [Federica Domani's AutoClicker2Ex](https://github.com/federicadomani/AutoClicker2-Record-Play-The-Lists-Of-Mouse-Clicks), which I can recommend but with the limitation that it can't click on a specific window unless it is visible on screen, so there may be better alternatives out there.
- `Use pm2 instead of npm start or others to run the program`
 
  Using [pm2](https://pm2.keymetrics.io/) ensures the program will keep running, otherwise, at least on Windows, you will have problems where it suddenly stops working after a while.
- `Do not set the program to run more than once every 5 minutes`

  People around have mentioned that your account could get banned if you run bots too often. No idea whether it's true or not, but since the page also blocks your IP faster if you do it's probably not worth it anyway.
- `Run 'pm2 start index.js' when the minutes on your system clock are one away from a number divisible by 5`

  Now that's a long title, and it will take even longer to explain! Again internet people mentioned that the page updates new appointments only when the clock strikes 5 minutes, for example, if it's 8 o'clock that would be at **8:00**, **8:05**, **8:10**, and so on. So the program is set up to wait and run at exactly those times if you are close enough to them (that is, less than one minute away, so `run the program at` **7:59**, **8:04**, **8:09**, ...). And in combination to this you should `run the auto clicker a minute earlier` than that (**7:58**, **8:03**, **8:08**) so it always has enough time to switch IPs before the program starts again.

## Additional features

- `Access the page where the bot is running`

By using Chrome's Inspector at "**chrome://inspect/#devices**" you can get inside the page where the bot is executing even in **production** mode, which allows you to take control if the bot gets stuck, or simply for debugging. Do be aware though that you should only go inside the page in those cases, because some things stop working correctly for some unknown reason, like the [ghost-cursor](https://www.npmjs.com/package/ghost-cursor).

- `Recording, screenshots and logging`

Whenever the bot finds an earlier date than the currently appointed one it will start recording the browser page for that session and later on store it at `./recordings` for your review. Which combined with various screenshots it takes at `./screenshots` and the `./log.txt` file can be very useful whenever problems arise, by allowing you to find out exactly what happened.

## Areas of improvement

> Country and Language Agnostic

_Everything was tested for Argentina's US Embassy page, with the language set to either english or spanish, and the original author's source code was made for Colombia's, and the original fork's for Mexico's (yes this is a fork of a fork). More testing would be required for other countries and languages. As a starting point I know for a fact that `./src/getCurrentAppointmentDate.js` is language dependent for the name of months, it requires a mapping from the original language to english. Also some countries do not need the ASC appointment, requiring changes to `./src/reserveAppointment.js`_

> Automate VPN IP switching

_Beyond the fact that it is annoying to have to add an auto clicker to the mix, the application itself would also benefit if it were able to speak to the VPN app directly. That way it would be able to switch IPs if it finds that the current one is no longer working._

> Improve Bot Detection Countermeasures

_Currently the bot quickly gets detected by the page's hCaptcha system, though it doesn't seem to ban your account or really do anything more than temporarily block your IP, it's not a guarantee that in the future it will always behave like that. I began to set up said countermeasures, but didn't finish because it already got me the date I needed_ 😅 _and also more importantly because I'm no expert in that field._

> Set up a loop to Check All Open Appointments up to some Target Date

_It sometimes happens that lots of dates get opened, but the first ones are actually invalid because there's no valid ASC date to accompany it. Thus the bot gets stuck on the first one and may have lost the chance to pick another equally good date that's under a target that the user could set as their desired maximum/latest appointment date._
