from types import ClassMethodDescriptorType
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import re

content = []
with open('log-dev-ver.txt') as f:
    for line in f:
        line = line.rstrip()  # 改行文字削除
        content.append(line)

content = [x for x in content if x != '' and 'ccb' in x]
content = [y.split(" ") for y in content]

results = []
results = [[c[1], c[-3], c[-1]] for c in content] # キャラ名・出目、成功失敗

pattern = '.*?(\d+).*'
## test dev-ver
for r in results:
    print(r[0], r[1], r[2])
    matched = re.match(pattern, r[2])
    print(matched.group(1))

for i in results: # 全角スペース削除
    i[0] = i[0].replace('\u3000', ' ')

print('total ccb:', len(results))

data = []
for i in results:
    data.append(i[1])


intdata=[]
for i, d in enumerate(data):
    print(i, d)
    try:
        intdata.append(int(d)) # グラフ描画のためint変換
    except:
        # print(d)
        print("error in maping str to int") # フォーマットに沿ってない例外を抹殺
        continue

nplist = np.array(intdata)
hist_data, bins = np.histogram(nplist, bins=10)
return_data = list(hist_data)
print(return_data)

# グラフ描画
# df = pd.DataFrame(intdata)
# plt.figure()
# df.hist()
# plt.title('Dice Histgram')
# plt.savefig('./hist')
# plt.close('all')
