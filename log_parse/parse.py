import pandas as pd
import matplotlib.pyplot as plt
import numpy as np


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
    hist_data, _ = np.histogram(nplist, bins=10, range=(1,100))
    return list(hist_data)


def log_analyze(content):
    
    results = log_split(content)

    histogram_data = make_histogram(results)
    return histogram_data

