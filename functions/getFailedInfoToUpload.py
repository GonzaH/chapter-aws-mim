import boto3
import os
import logging
import json


ALL_CHAPTER_OBJECT_INFO = "fullChaptersInfo.json"


def get_all_chapter_titles():
  STAGE = os.environ.get('STAGE', '')
  BUCKET = f'chapters-info-{STAGE}'

  s3 = boto3.client("s3")

  object_info = s3.get_object(Bucket=BUCKET, Key=ALL_CHAPTER_OBJECT_INFO)
  json_content = object_info['Body'].read().decode('utf-8')
  file_info = json.loads(json_content)

  titles = list(file_info.keys())

  return titles


def get_info_not_in_s3(to_insert, titles):
  return [record for record in to_insert if record['title'] not in titles]


def handler(event, context):
  try:
    titles = get_all_chapter_titles()
    useful_info = [info for info in event['valid_file_content'] if info]

    to_insert = get_info_not_in_s3(useful_info, titles)

    event['to_insert'] = to_insert
    event['to_insert_len'] = len(to_insert)
    
    return event
  except Exception as ex:
    logging.error(f'The error {ex}')

    raise ex
