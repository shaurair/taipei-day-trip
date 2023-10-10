import os
from dotenv import load_dotenv
import mysql.connector
from mysql.connector import pooling

load_dotenv()

MysqlConnectInfo = {
	"user" : os.getenv("DB_USERNAME"),
	"password" : os.getenv("DB_PASSWORD"),
	"host" : "localhost",
	"database" : "TaipeiAttr"
}

connection_pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **MysqlConnectInfo)