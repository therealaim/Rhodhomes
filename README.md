# RHODHOMES Rental Referral Partner Application (Vercel)

A public, mobile-friendly, 7-step application form. When someone submits,
the server checks every answer again and emails the full application
(styled in RHODHOMES colours, Arial) to your inbox. No database, no login portal.

```
public/index.html      HOME PAGE (rent / buy / sell enquiry form, partner link)
public/apply.html      PARTNER APPLICATION page (7-step form)
public/home.js, enquiry-config.js     home page enquiry form + its rules
public/app.js, form-config.js         application form + its rules
api/enquiry.js         backend for rent/buy/sell enquiries (validates + emails)
api/submit.js          backend for partner applications (validates + emails)
vercel.json            security headers + function settings
```
Both backends use the SAME two Vercel variables below, so nothing extra to set up.
Extra tests for the home page: tap Rent/Buy/Sell cards (form switches and keeps your typing),
submit an enquiry and check it arrives at rhodhomes@outlook.com titled "New Rent enquiry - ...".
To change wording (company description, areas), edit `public/index.html`.

## Set up from an Android phone (about 15 minutes)

### Step 1 - Email sending account (free)
1. In your phone browser open **resend.com** and tap Sign Up.
2. **Sign up with rhodhomes@outlook.com.** This matters: without a verified domain,
   Resend only delivers to the email you signed up with, and that is exactly your inbox.
3. Confirm the verification email (check Outlook, also Junk).
4. Open **API Keys** -> **Create API Key** -> permission "Sending access" -> copy the key
   (starts with `re_`). Keep it private. You will paste it into Vercel in Step 4.

### Step 2 - Put the code on GitHub
1. Unzip `rhodhomes-vercel.zip` (Files app -> tap the zip -> Extract).
2. Go to **github.com** -> sign in -> **New repository** -> name it `rhodhomes` -> Create.
3. Tap **uploading an existing file**, upload everything inside the unzipped folder
   (keep the `api` and `public` folders, plus `vercel.json` and `package.json`),
   then **Commit changes**.
   Tip: if folders will not upload from your phone browser, use Acode/Termux:
   `git init && git add . && git commit -m "RHODHOMES" && git remote add origin <repo-url> && git push -u origin main`

### Step 3 - Import into Vercel
1. Open **vercel.com** -> Continue with GitHub -> **Add New... -> Project**.
2. Pick the `rhodhomes` repo -> **Import**.
3. Leave Framework as "Other". Do NOT press Deploy yet - open **Environment Variables** first.

### Step 4 - Add the secrets (never put these in code)
| Name | Value |
|------|-------|
| `RESEND_API_KEY` | the `re_...` key from Step 1 |
| `NOTIFY_EMAIL` | `rhodhomes@outlook.com` |
| `FROM_EMAIL` | (optional) leave empty for now |

Now tap **Deploy**. When finished, tap the preview to open your live site.

### Step 5 - Test (checklist)
- [ ] Site opens on your phone; logo shows, "APPLY TO BECOME A PARTNER" jumps to the form.
- [ ] Tapping Next with empty fields shows red messages.
- [ ] Tick WhatsApp - an extra number box appears. Go Back and Next - answers are still there.
- [ ] Review page shows all answers; each Edit button returns to that section.
- [ ] Submit is blocked until all 3 declarations are ticked.
- [ ] Submit a real test application. You see the green success screen with a reference like `RH-20261102-AB12CD`.
- [ ] The email arrives at rhodhomes@outlook.com (check Junk the first time). Mark it "Not junk".
- [ ] Press Reply on that email - it should address the applicant.
- [ ] Double-tapping Submit does not send two emails.

## If something fails
- Applicant sees "temporarily unavailable": `RESEND_API_KEY` or `NOTIFY_EMAIL` is missing/misspelled in Vercel -> Settings -> Environment Variables, then **Redeploy**.
- Applicant sees "could not submit": Resend rejected the email (wrong key, or you signed up to Resend with a different address). In Vercel -> your project -> **Logs**, you will see the HTTP status only (no applicant data is logged).
- Email in Junk: mark "Not junk". For best delivery later, verify your own domain in Resend and set `FROM_EMAIL` to e.g. `RHODHOMES <apply@yourdomain.com>`.

## Important honesty notes
- There is NO database. The email IS the record. The applicant is told "submitted" only after Resend confirms it accepted the email. If you delete the email, the application is gone, so keep them or forward them.
- Spam protection is basic: hidden trap field, minimum fill time, per-IP rate limit, same-site check. For heavier spam, add Cloudflare Turnstile later.
- Duplicate protection: each form session has a unique ID, so retries and double taps return the same reference and do not send a second email.
- Applicant data is never written to logs. Your address lives only in the Vercel environment variable, never in the website code.
- Add a Privacy Policy / Programme Terms page link when you have them; the form currently shows the declarations text only.

## Home page notes
- No phone, WhatsApp, public email or street address is shown; only "Irvine, California, USA".
- There are no property listings; the page is enquiry-only. Do not add listings you do not have authority to advertise.
- Check with a qualified professional whether California/US rules (e.g. real estate licensing for buy/sell services, and fair housing wording) require anything more on this page before you promote it.
