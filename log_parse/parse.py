from types import ClassMethodDescriptorType
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

def log_split(content):
    content = content.replace("\r\n", "\n")
    content = content.replace("\r", "\n")
    content = content.split("\n")
    content = [x for x in content if x != '' and ('CCB' in x  or 'ccb' in x or 'cc' in x)]
    content = [y.split(" ") for y in content]
    
    results = []
    results = [[c[1], c[-3], c[-1]] for c in content if len(c)>=3] # キャラ名、出目、成功失敗

    for i in results: # 全角スペース削除
        i[0] = i[0].replace('\u3000', ' ')

    return results

#[[キャラ名、出目、成功失敗],…]となっているリストを渡すとlist(ヒストグラム)を返す関数
def make_histogram(results):
    print('total CCB:', len(results))

    data = []
    for i in results:
        data.append(i[1])

    intdata=[]
    for d in data:
        try:
            intdata.append(int(d)) # グラフ描画のためint変換
        except:
            print(d)
            print("error in maping str to int") # フォーマットに沿ってない例外を抹殺
            continue
    nplist = np.array(intdata)
    hist_data, _ = np.histogram(nplist, bins=10)
    return list(hist_data)

def log_analyze(content):
    
    results = log_split(content)

    histogram_data = make_histogram(results)
    return histogram_data

