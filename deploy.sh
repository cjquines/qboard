sed -i 's/f="\//f="/g' dist/index.html
sed -i 's/c="\//c="/g' dist/index.html
rm dist/*.map
rsync -avzP --delete ~/code/qboard/dist/ cjquines_cjquines@ssh.phx.nearlyfreespeech.net:/home/public/qboard/