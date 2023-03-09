import boto3
import os
import logging

def handler(event, context):
  try:
    STAGE = os.environ.get('STAGE', '')
    REGION = os.environ.get('REGION', '')
    ACCOUNT_NUMBER = os.environ.get('ACCOUNT_NUMBER', '')
    SF_ARN = f'arn:aws:states:{REGION}:{ACCOUNT_NUMBER}:stateMachine:getBrokenSeries-{STAGE}'

    step_functions = boto3.client("stepfunctions")

    step_functions.start_execution(stateMachineArn=SF_ARN)

    return "SUCC"
  except Exception as exc:
    logging.error(f'The error {exc}')

    raise exc
