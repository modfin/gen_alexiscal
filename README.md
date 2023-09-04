
# AlexisHR Calendar Sync
AlexisHR does not provide any resonable way of adding the away calendar to 
an external calendar service. Eg Google Calendar.

This is a Cloudflare Worker that syncs Away events (people on vacation and such) from Alexis API into a KV
store. The KV store can then be used to generate ical files delivered through HTTP which enables import of the 
calendar to 3ed party applications.

## Installation & Deployment

1. Ensure you have a Cloudflare account
2. Retrieve a Alexis API key (the admin section of alexishr)

```bash
git clone https://github.com/modfin/gen_alexiscal
./generate.sh

## Dev 
npx wrangler dev --test-scheduled

## Publish
npx wrangler deploy

## Calendar events are synced from Alexis every 60min
## Calendar for all employees can be retrieved on
##   https://your-domain.tld?api-key=the-key
## Calendar for employees in specific department
##   https://your-domain.tld?api-key=the-key&departments=Developers,Sales

```