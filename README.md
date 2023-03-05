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
