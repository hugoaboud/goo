C1='\033[0;33m'
C2='\033[0;36m'
NC='\033[0m' # No Color

echo $C1-[Lib]$C2 Building$NC
cd lib
npm run bundle
cd ..

echo $C1-[Loader]$C2 Building$NC
cd loader
npm run bundle
cd ..