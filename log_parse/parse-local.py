from types import ClassMethodDescriptorType
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import re

def exits_ccb(list):
    for l in list:
        if 'ccb' in l:
            return True
        else:
            continue
    return False

content = []
with open('/home/minatosingull/ccfolia-log/dummy.log') as f:
    for line in f:
        line = line.rstrip()  # 改行文字削除
        content.append(line)
content = [x for x in content if x != '' and ('CCB' in x  or 'ccb' in x or 'CC' in x or 'cc' in x or 'RESB' in x or 'resb' in x)]
content = [y.split(" ") for y in content]

print("content", content)
cf = {"critical":0, "fumble":0} # critical, fumble

for c in content:
    if '決定的成功' in c[-1]:
        cf["critical"]+=1
    if '致命的失敗' in c[-1]:
        cf["fumble"]+=1

print("critical/fumble", cf)

results = []
results = [[c[1], c[-3], c[-1]] for c in content] # キャラ名・出目、成功失敗

for i in content: # 全角スペース削除
    try:
        i[1]
        i[1] =i[1].replace('\u3000', ' ')
    except:
        continue

    results=[] # [[キャラ名, 出目, 成功失敗]]
for c in content:
    if exits_ccb(c):
        pattern = '.*?(\d+).*' # 数字抽出用
        matched = re.match(pattern, c[-1])
        if matched != None: # 開発バージョンのココフォリアのフォーマットの場合
            results.append([c[0], matched.group(1), c[-1][-3:-1]])
    elif len(c)>=3:
        results.append([c[1], c[-3], c[-1]])

print('total ccb:', len(results))

data = []
for i in results:
    data.append(i[1])


intdata=[]
for i, d in enumerate(data):
    # print(i, d)
    try:
        intdata.append(int(d)) # グラフ描画のためint変換
    except:
        # print(d)
        print("error in maping str to int") # フォーマットに沿ってない例外を抹殺
        continue

nplist = np.array(intdata)
hist_data, bins = np.histogram(nplist, bins=10, range=(1,101))
return_data = list(hist_data)
# print(return_data)

# # グラフ描画
# df = pd.DataFrame(intdata)
# plt.figure()
# df.hist(bins=range(1,110,10))
# plt.title('Dice Histgram')
# plt.savefig('./hist_dev_ver.png')
# plt.close('all')
