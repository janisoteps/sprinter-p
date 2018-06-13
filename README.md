A tool that connects to JIRA ticket API to retrieve tickets for each sprint.

Then sprints can be selected to view tickets in sprint.

Together with ticket information has SQLite3 DB with disk file implemented
to run with Express back end.
In disk db testing data is stored for tickets.
This enables testing planning and tracking within the tool in maximally
automated fashion.

To launch app, navigate to root directory and run:

npm run start

This will launch Express server that also serves up the static content.
