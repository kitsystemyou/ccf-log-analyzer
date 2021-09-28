import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import re

def log_split(content):
    content = content.replace("\r\n", "\n")
    content = content.replace("\r", "\n")
    content = content.split("\n")
    content = [x for x in content if x != '' and ('CCB' in x  or 'ccb' in x or 'CC' in x or 'cc' in x or 'RESB' in x or 'resb' in x)]
    content = [y.split(" ") for y in content]

    for i in content: # 全角スペース削除
        i[1] =i[1].replace('\u3000', ' ')

    results=[] # [[キャラ名, 出目, 成功失敗]]
    for c in content:
        if len(c)>=3:
            results.append([c[1], c[-3], c[-1]])
        if exits_ccb(c):
            pattern = '.*?(\d+).*' # 数字抽出用
            matched = re.match(pattern, c[-1])
            if matched != None: # 開発バージョンのココフォリアのフォーマットの場合
                print("dev-version")
                results.append([c[0], matched.group(1), c[-1][-3:-1]])
                print(matched.group(1))
    return results

def exits_ccb(list):
    for l in list:
        if 'ccb' in l:
            return True
        else:
            continue
    return False

#[[キャラ名、出目、成功失敗],…]となっているリストを渡すとlist(ヒストグラム)を返す関数
def make_histogram(results):
    print(results)
    print('total CCB:', len(results))

    intdata=[]
    for d in results:
        try:
            intdata.append(int(d[1])) # グラフ描画のためint変換
        except:
            # print(d)
            print("error in maping str to int") # フォーマットに沿ってない例外を抹殺
            continue
    nplist = np.array(intdata)
    print("nplist", nplist, len(nplist))
    hist_data, _ = np.histogram(nplist, bins=10)
    print(np.sum(hist_data))
    return list(hist_data)


def log_analyze(content):
    
    results = log_split(content)

    histogram_data = make_histogram(results)
    return histogram_data

