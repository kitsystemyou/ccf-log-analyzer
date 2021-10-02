from re import A
import re
from numpy.lib.shape_base import apply_along_axis
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import json


def log_split(content):
    content = content.replace("\r\n", "\n")
    content = content.replace("\r", "\n")
    content = content.split("\n")
    content = [x for x in content if x != '' and ('CCB' in x  or 'ccb' in x or 'CC' in x or 'cc' in x or 'RESB' in x or 'resb' in x)]
    content = [y.split(" ") for y in content]

    for i in content: # 全角スペース削除
        i[1] =i[1].replace('\u3000', ' ')

    content = [[c[1], c[-3], c[-1]] for c in content if len(c)>=3] # キャラ名、出目、成功失敗

    return content

def split_user(results):
    user_namelist = []
    for i in results:
        if not i[0] in user_namelist:
            user_namelist.append(i[0])
    results_user = []
    for name in user_namelist:
        result = []
        for i in results:
            if name in i:
                result.append(i)
        results_user.append(result)
    return results_user,user_namelist

#[[キャラ名、出目、成功失敗],…]となっているリストを渡すとlist(ヒストグラム)を返す関数
def make_histogram(results):
    print('total CCB:', len(results))

    intdata=[]
    for d in results:
        try:
            intdata.append(int(d[1])) # グラフ描画のためint変換
        except:
            print(d)
            print("error in maping str to int") # フォーマットに沿ってない例外を抹殺
            continue
    nplist = np.array(intdata)
    hist_data, _ = np.histogram(nplist, bins=10)
    return list(hist_data)


def log_analyze(content):
    
    results = log_split(content)
    results_user,user_namelist = split_user(results)
    mydict = {"result":[]}
    for data,name in zip(results_user,user_namelist):
        mydict["result"].append({"name":str(name),"hist_data":make_histogram(data)})
    print(mydict)
    histogram_data = make_histogram(results)
    mydict["result"].insert(0,{"name":"全体","hist_data":histogram_data})
    return mydict
