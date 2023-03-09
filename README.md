# Prerequisites:
- serverless framework: `npm install -g serverless`
- aws account
- [aws cli](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html)

# Sections:

## 1. Base setup
- Add env
- Add base provider info in serverless.yml

## 2. S3 setup
- Add s3 info to serverless.yml

## 3. Lambdas
- Add a s3 service to be consumed by the lambdas code
- Add functions for
  - creating
  - getting
  - updating
- Create lambdas with API gateway triggers

## 4. SNS
- Create a topic
- Notify via email to al subscribed users

## 5. S3 Trigger
- Add a trigger to detect new files
- Use same function as http to handle new series

## 6. StepFunction
- Create lambdas in python to handle broken files
- Create a step function with waits and decitions to show base procedure

## 7. Crons n SQS
- Add a function that triggers the SF
- Add crons expressions to call that as cron and rate
- Replace lambda invoke with a SQS