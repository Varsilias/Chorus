## Chorus Assessment

_Task 1: Write an API that manages load balancing for transaction processing to ensure speed and integrity. For instance, the backend could be connected to multiple switches to ensure optionality and maximize uptime, and the service could test connections to ensure functionality before sending messages_

## Local Development Setup

**Prerequisites:** Ensure that ports **6000**, **8080** and **5432** are free on your local machine, if not look at step 4 in **Setup Steps** to see how to make them free

These are all the steps you should follow to set up this project on your local machine successfully. These processes should work across all machines that have [NodeJS](https://nodejs.org/en) and [Docker](https://www.docker.com/) Installed. Don't panic if you don't have these tools installed; here is a link to download each one.

Chances are you found this project on GitHub Which means you should have Git Installed and also know how to use Git for Version Control. In case you do not, I have also attached a link to Download Git to your Machine.

- [Link to download the LTS (Long Term Support) version of NodeJS](https://nodejs.org/en/download/package-manager)
- [Link to download Docker for any platform of your choice](https://www.docker.com/products/docker-desktop/)
- [Link to download Git](https://git-scm.com/downloads)

If you require a refresher on Git I recommend this tutorial from W3Schools - [Git Tutorial](https://www.w3schools.com/git/)

1. Clone the repository by running the command `git clone git@github.com:Varsilias/Chorus.git`
2. Every credential you need to get this app up and running is in the `.env` and `.env.test` files. The `.env` file is for local development, while the `.env.test` file is for testing. Also, these files were left intentionally to make it easier for you to get this app up and running, in the real-world scenario, you would not want to expose your credentials in the repository.
3. Run `yarn install` or `yarn` to install all project dependency
4. If the ports listed in the **prerequisites** section above are not free, run the command `npm run kill:ports` or `yarn kill:ports` in Gitbash terminal on windows or any terminal of your choice in MacOS or Linux
5. Run `docker compose up` to start all services(app-core, postgres database, database client) used in this application
6. Visit the database client at `http://localhost:8080`. You are free to use any other database client you want

**NB:** The command in **Step 5** would take a considerable amount of time when it is run for the first time, the time will reduce drastically when run subsequently

7. Run `npm run test` or `yarn test` to run all the unit test cases in this project
8. For the integration test, you would need to create a `.env.test` file which you already have. Then run `docker compose -f docker-compose-test.yaml --env-file .env.test up` to run the integration test cases in this project
9. To see the your database table and data in each table go to [http://localhost:8080](http://localhost:8080) select **PostgreSQL** as the System, leave the **Server** field as is, proceed to fill in the rest of the input field. See the image below for reference

**NB:** The value for the rest of the input field come from your `.env`. DB_USER value for the Username field, DB_NAME for the Database field, DB_PASSWORD for the Password field

![Adminer Login Screen](https://github.com/Varsilias/Chorus/blob/main/adminer.png)

#### Data Model

![Chorus Data Model](https://github.com/Varsilias/Chorus/blob/main/chorus-data-model.png)

## API Documentation

[Link to Postman API Documentation](https://documenter.getpostman.com/view/10967402/2sAY545y8m)

## Solution Architecture

![Chorus Solution Architecture](https://github.com/Varsilias/Chorus/blob/main/one-phase-commit-transaction-api.png)
