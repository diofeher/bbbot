BBBot + OpenCV
===============

Paredão dessa semana:
Prior - 1
Manu - 2
Mari - 3


Você precisa exportar duas variáveis para poder logar no site da Globo e uma para o participante que vai ser votado:

```
export GLOBO_USERNAME='your-email@globo.com'
export GLOBO_PASSWORD='xxxxxxxxx'
export PARTICIPANTE=3
```

PARTICIPANTE se refere à posição do participante. Caso ele seja o primeiro da lista, colocar um 1,
o do meio 2 e o último 3.

INSTALAÇÃO NO WINDOWS
=====================

1) Instale a versão mais nova do node.js https://nodejs.org/en/download/
2) Instale a versão mais nova do Python3 https://www.python.org/downloads/windows/
3) Instale essa versão específica do openCV https://sourceforge.net/projects/opencvlibrary/files/opencv-win/3.4.2/opencv-3.4.2-vc14_vc15.exe/download
3) Rode o arquivo `instalador-windows.bat` para instalação de programas auxiliares
4) Rode o bot com `rodar-windows.bat`. Um prompt será mostrado perguntando suas informações (conta/senha globo, participante que quer votar)
5) Caso o bot dê problema, tente votar manualmente primeiro com sua conta só pra depois tentar utilizar o bot.

INSTALAÇÃO EM MAC E LINUX
==============

Instale o Python3 e o Node.JS

Depois de instalar essas duas dependências, rode os seguinte comandos:

```
pip3 install -r requirements.txt
npm install
```

Rodando o bot:

```
npm start
```

TODO
=====

  - Precisa melhorar em condições adversas (clique errado, dois cliques no captcha);
  - Colocar no docker.hub;
  - Cleanup das pastas de imagens;

Inspirado no https://github.com/DanielHe4rt/bbbot/ porém usando uma abordagem diferente para quebrar o captcha.
Obrigado! @DanielHe4rt
