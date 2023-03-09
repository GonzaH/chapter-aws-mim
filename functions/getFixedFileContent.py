import boto3
import os
import logging
import json
from difflib import SequenceMatcher


def get_title(json_content):
  title_possibilities = []

  for key in json_content:
    similarity = SequenceMatcher(None, key, "title").ratio()

    if similarity >= 0.8:
      title_possibilities.append({ 'key': key, 'similarity': similarity })

  if not title_possibilities: return ''

  better_title_info = max(title_possibilities, key = lambda title_info: title_info['similarity'])
  better_title_key = better_title_info['key']

  return json_content[better_title_key]


def handler(event, context):
  try:
    logging.error(f'The event: {event}')

    STAGE = os.environ.get('STAGE', '')
    BUCKET = f'chapters-info-{STAGE}'

    s3 = boto3.client("s3")

    object_info = s3.get_object(Bucket=BUCKET, Key=event)
    json_content = object_info['Body'].read().decode('utf-8')
    file_info = json.loads(json_content)

    real_title = get_title(file_info)

    if not real_title: return None

    chapter = file_info.get('chapter', 0)
    season = file_info.get('season', 1)

    return { 'title': real_title, 'chapter': chapter, 'season': season }
  except Exception as ex:
    logging.error(f'The error {ex}')

    raise ex
