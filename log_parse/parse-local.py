from types import ClassMethodDescriptorType
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

content = []
with open('fin-session.log') as f:
    for line in f:
        line = line.rstrip()  # 改行文字削除
        content.append(line)

content = [x for x in content if x != '' and 'CCB' in x]
content = [y.split(" ") for y in content]

results = []
results = [[c[1], c[-3], c[-1]] for c in content] # キャラ名・出目、成功失敗

for i in results: # 全角スペース削除
    i[0] = i[0].replace('\u3000', ' ')

print('total CBC:', len(results))

data = []
for i in results:
    data.append(i[1])

# グラフ描画
intdata=[]
for i, d in enumerate(data):
    print(i, d)
    try:
        intdata.append(int(d)) # グラフ描画のためint変換
    except:
        # data.remove(d) # remove するとインデックスが変わってしまい次のデータがスキップされる
        print(d)
        print("error in maping str to int") # フォーマットに沿ってない例外を抹殺
        continue

nplist = np.array(intdata)
hist_data, bins = np.histogram(nplist, bins=10)
return_data = list(hist_data)
print(return_data)
# df = pd.DataFrame(intdata)
# plt.figure()
# df.hist()
# plt.title('Dice Histgram')
# plt.savefig('./hist')
# plt.close('all')
