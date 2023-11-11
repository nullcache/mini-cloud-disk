#!/usr/bin/env bash

# 使用方法：
# ./genModel.sh 库名 表名

#生成的表名
tables=$2
#表生成的genmodel目录
modeldir=../../internal/model

# 数据库配置
host=localhost
port=3306
dbname=$1
username=root
passwd=123456


echo "开始创建库：$dbname 的表：$2"
goctl model mysql datasource -url="${username}:${passwd}@tcp(${host}:${port})/${dbname}" -table="${tables}"  -dir="${modeldir}" --style=goZero