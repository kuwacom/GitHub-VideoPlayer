import './assets/main.css';
import { init, projectVersion } from './utils/utils';

import videoIndex from '../public/videos/index.json';

console.log("Ready GitHub-VideoPlayer");

// const graphDiv = document.getElementsByClassName('graph-before-activity-overview')[0];
// if (graphDiv) graphDiv.innerHTML = `
// <a href="https://github.com/kuwacom/GitHub-VideoPlayer" class="playercredit gaming">GitHub-VideoPlayer - v${projectVersion}</a>
// ` + graphDiv.innerHTML;

init(()=>{ // credit追加
    const header = document.getElementsByClassName('AppHeader-context-full')[0];
    const navElement = header.querySelector('nav');
    if (!navElement) return
    // nav要素の下のul要素を取得
    const ulElement = navElement.querySelector('ul');
    
    if (ulElement) {
        // 新しいli要素を作成し、ul要素の中に追加
        const newLi = document.createElement('li');
        newLi.innerHTML =`
            <a href="https://github.com/kuwacom/GitHub-VideoPlayer" class="playercredit gaming">GitHub-VideoPlayer - v${projectVersion}</a>
        `;
        ulElement.appendChild(newLi);
    }
});


init(()=>{ // 再生ボタンの追加
    const graphDiv = document.getElementsByClassName('graph-before-activity-overview')[0];
    if (!graphDiv) return;
    
    const container = document.createElement('div');
    container.classList.add('github-container');

    // const inputFile = document.createElement('input');
    // inputFile.type = 'file';
    // inputFile.id = 'videoFileInput';
    // inputFile.classList.add('github-input');
    
    // ビデオ選択メニューの作成
    const videoSelect = document.createElement('select');
    videoSelect.id = 'videoSelect';
    videoSelect.classList.add('github-select');
    videoIndex.forEach(video => {
        const option = document.createElement('option');
        option.value = video.path;
        option.textContent = video.name;
        videoSelect.appendChild(option);
    });

    const widthInput = document.createElement('input');
    widthInput.type = 'number';
    widthInput.id = 'widthInput';
    widthInput.placeholder = 'Width';
    widthInput.classList.add('github-input-number');
    widthInput.step = '1'; // スピンボタンを表示
    widthInput.value = '48';
    
    const heightInput = document.createElement('input');
    heightInput.type = 'number';
    heightInput.id = 'heightInput';
    heightInput.placeholder = 'Height';
    heightInput.classList.add('github-input-number');
    heightInput.step = '1'; // スピンボタンを表示
    heightInput.value = '21';
    
    const buttonContainer = document.createElement('div');
    buttonContainer.classList.add('github-button-container');
    
    const playButton = document.createElement('button');
    playButton.id = 'playButton';
    playButton.textContent = 'Play';
    playButton.classList.add('github-button');
    
    const pauseButton = document.createElement('button');
    pauseButton.id = 'pauseButton';
    pauseButton.textContent = 'Pause';
    pauseButton.classList.add('github-button');
    
    // container.appendChild(inputFile);
    container.appendChild(videoSelect);
    
    buttonContainer.appendChild(widthInput);
    buttonContainer.appendChild(heightInput);
    
    buttonContainer.appendChild(playButton);
    buttonContainer.appendChild(pauseButton);
    container.appendChild(buttonContainer);

    graphDiv.appendChild(container);
}, 1200);

export { projectVersion }