import mysql.connector
from mysql.connector import pooling

MysqlConnectInfo = {
	"user" : "root",
	"password" : "root123",
	"host" : "localhost",
	"database" : "TaipeiAttr"
}

connection_pool = pooling.MySQLConnectionPool(pool_name="mypool", pool_size=5, **MysqlConnectInfo)