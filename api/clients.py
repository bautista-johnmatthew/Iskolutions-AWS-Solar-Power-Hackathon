import os

import boto3
from boto3.resources.base import ServiceResource
from botocore.client import BaseClient
from mypy_boto3_dynamodb.service_resource import Table

class AWSClients:
    """
    AWS Clients for interacting with various AWS services.
    """

    def __init__(self):
        self.dynamodb: ServiceResource = boto3.resource("dynamodb")
        self.s3: BaseClient = boto3.client("s3")
        self.table: Table = self.dynamodb.Table(os.getenv("DYNAMO_DB_TABLE"))

# Dependency function
def get_aws_clients() -> AWSClients:
    return AWSClients()