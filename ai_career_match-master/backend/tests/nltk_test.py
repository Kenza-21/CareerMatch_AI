import nltk
from nltk.stem import SnowballStemmer
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords

# à faire une seule fois
nltk.download('punkt')
nltk.download('stopwords')

text = "This is a simple test sentence."

tokens = word_tokenize(text)
stop_words = set(stopwords.words("english"))
filtered = [w for w in tokens if w.lower() not in stop_words]

stemmer = SnowballStemmer("english")
stems = [stemmer.stem(w) for w in filtered]

print(stems)
