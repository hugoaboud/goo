C1='\033[0;33m'
C2='\033[0;36m'
NC='\033[0m' # No Color

echo $C1-[Lib]$C2 Installing NPM dependencies$NC
cd lib
npm i
cd ..

echo $C1-[Loader]$C2 Installing NPM dependencies$NC
cd loader
npm i
cd ..

echo $C1-[Template]$C2 Installing NPM dependencies$NC
cd template
npm i
cd ..