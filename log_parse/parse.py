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
        if exits_ccb(c):
            pattern = '.*?(\d+).*' # 数字抽出用
            matched = re.match(pattern, c[-1])
            if matched != None: # 開発バージョンのココフォリアのフォーマットの場合
                results.append([c[0], matched.group(1), c[-1][-3:-1]]) # TODO: クリファン判定できるようにする
        elif len(c)>=3:
            results.append([c[1], c[-3], c[-1]])
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
    print('total CCB:', len(results))

    intdata=[]
    for d in results:
        try:
            intdata.append(int(d[1])) # グラフ描画のためint変換
        except:
            print("error in maping str to int") # フォーマットに沿ってない例外を抹殺
            continue
    nplist = np.array(intdata)
    hist_data, _ = np.histogram(nplist, bins=10, range=(1,100))
    return list(hist_data)


def critical_fumble(results):
    cf = {"critical":0, "fumble":0} # critical, fumble
    for r in results:
        if '決定的成功' in r[-1] or 'Special'in r[-1]:
            cf["critical"] += 1
        if '致命的失敗' in r[-1] or 'Fumble'in r[-1]:
            cf["fumble"] += 1
    try:
        (len(results)==0)
        cf["critical_percent"] = int(100*cf["critical"]/len(results))
        cf["fumble_percent"] = int(100*cf["fumble"]/len(results))
    except:
        return {}
    return cf


def log_analyze(content):
    results = log_split(content)
    histogram_data = make_histogram(results)
    cf_data = critical_fumble(results)
    cf_data["total"]=len(results)
    print("cf", cf_data)
    return histogram_data, cf_data

