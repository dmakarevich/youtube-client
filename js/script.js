let currentPage = null;

function getVideos(search = '') {
  const totalVideosCount = localStorage.getItem('totalVideosCount');
  fetch(`https://www.googleapis.com/youtube/v3/search?key=AIzaSyCTWC75i70moJLzyNh3tt4jzCljZcRkU8Y&type=video&part=snippet&maxResults=${totalVideosCount}&q=${search}`)
    .then(response => {
      return response.json();
    })
    .then(videos => {
      localStorage.setItem('response', JSON.stringify(videos));
      parseVideos(videos);
    });
}

function generateHeader() {
  const header = document.createElement('div');
  header.classList.add('header');

  const logoLink = createLogoBlock();
  const searchBlock = createSearchBlock();

  header.appendChild(logoLink);
  header.appendChild(searchBlock);

  document.body.appendChild(header);
}

function generateMain () {
    const mainBlock = document.createElement('div');
    mainBlock.classList.add('main');

    document.body.appendChild(mainBlock);
}

function generateFooter () {
    const footer = document.createElement('div');
    footer.classList.add('footer')

    const pagination = document.createElement('div');
    pagination.classList.add('pagination');

    const list = document.createElement('ul');
    pagination.appendChild(list);
    footer.appendChild(pagination);

    document.body.appendChild(footer);
}

function createLogoBlock() {
  const logoLink = document.createElement('a');
  logoLink.href = 'https://youtube.com';
  logoLink.classList.add('logo');

  const logoImg = document.createElement('img');
  logoImg.src = 'img/youtube.png';
  logoImg.alt = 'YouTube Logotype';

  const logoTitle = document.createElement('span');
  logoTitle.classList.add('logo-title');
  logoTitle.innerHTML = 'YouTube';

  logoLink.appendChild(logoImg);
  logoLink.appendChild(logoTitle);

  return logoLink;
}

function createSearchBlock() {
  const searchBlock = document.createElement('div');
  searchBlock.classList.add('search-group', 'has-search');

  const searchImg = document.createElement('span');
  searchImg.classList.add('fa', 'fa-search', 'form-control-feedback');

  const searchField = document.createElement('input');
  searchField.type = 'text';
  searchField.placeholder = 'Search';
  searchField.classList.add('form-control');

  searchBlock.appendChild(searchImg);
  searchBlock.appendChild(searchField);

  return searchBlock;
}

function createVideoCoverElement(videoId, videoHref, videoTitle) {
  const videoLink = document.createElement('a');
  videoLink.href = `https://www.youtube.com/watch?v=${videoId}`;

  const videoCover = document.createElement('img');
  videoCover.src = videoHref;
  videoCover.title = videoTitle;
  videoCover.alt = videoTitle;

  videoLink.appendChild(videoCover);

  return videoLink;
}

function createTitleElement(videoTitle) {
  const titleBlockLength = parseInt(localStorage.getItem('titleBlockLength'));
  const title = document.createElement('div');

  title.classList.add('video-title');
  title.innerHTML = ((videoTitle.length > titleBlockLength) ?  videoTitle.substr(0, titleBlockLength) + '...' : videoTitle);
  title.title = videoTitle;

  return title;
}

function createChannelBlock(channelName, channelId) {
  const channelBlock = document.createElement('div');
  channelBlock.classList.add('channel-block');

  const channelIcon = document.createElement('i');
  channelIcon.classList.add('fas', 'fa-user-alt');

  const channelNameLength = parseInt(localStorage.getItem('channelNameLength'));
  const channel = document.createElement('a');
  channel.classList.add('channel');
  channel.innerHTML = (channelName.length > 29) ? channelName.substr(0, channelNameLength) + '...' : channelName ;
  channel.title = channelName;
  channel.href = `https://www.youtube.com/channel/${channelId}`;
  channelBlock.appendChild(channelIcon);
  channelBlock.appendChild(channel);

  return channelBlock;
}

function createDateBlock(publishedDate) {
  const dateBlock = document.createElement('div');
  dateBlock.classList.add('date-block');

  const dateIcon = document.createElement('i');
  dateIcon.classList.add('far');
  dateIcon.classList.add('fa-calendar-alt');

  const dateField = document.createElement('span');
  dateField.classList.add('date');
  const date = new Date(publishedDate);
  dateField.innerHTML = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);
  dateBlock.appendChild(dateIcon);
  dateBlock.appendChild(dateField);

  return dateBlock;
}

function createDescriptionElement(descriptionText) {
  const description = document.createElement('p');
  description.classList.add('description');
  description.innerText = descriptionText;

  return description;
}

function pageIsInRange(j, i) {
  const startPosition = localStorage.getItem('startPosition');
  const countVideosOnPage = parseInt(localStorage.getItem('countVideosOnPage'));

  return (j >= startPosition) && (i <= (countVideosOnPage));
}

function videoBlockFormation(video, mainBlock) {
  const snippet = video['snippet'];
  const videoTitle = snippet['title'];

  const videoBlock = document.createElement('div');
  videoBlock.classList.add('video-block');

  const videoLink = createVideoCoverElement(video['id']['videoId'], snippet['thumbnails']['medium']['url'], videoTitle);
  const videoInfo = document.createElement('div');
  videoInfo.classList.add('video-info');

  const title = createTitleElement(videoTitle);
  const channelBlock = createChannelBlock(snippet['channelTitle'], snippet['channelId']);
  const dateBlock = createDateBlock(snippet['publishedAt']);
  const description = createDescriptionElement(snippet['description']);

  videoInfo.appendChild(title);
  videoInfo.appendChild(channelBlock);
  videoInfo.appendChild(dateBlock);
  videoInfo.appendChild(description);

  videoBlock.appendChild(videoLink);
  videoBlock.appendChild(videoInfo);

  mainBlock.appendChild(videoBlock);
}

function parseVideos(videos) {
  const mainBlock = document.querySelector('.main');

  while (mainBlock.hasChildNodes()) {
    mainBlock.removeChild(mainBlock.lastChild);
  }

  let i = 1;
  let j = 1;
  videos['items'].forEach(video => {
    if (pageIsInRange(j, i))  {
      videoBlockFormation(video, mainBlock);
      i++;
    }
    j++;
  });
}

function initPagination () {
  let list = document.querySelector('.pagination>ul');
  let numPages = localStorage.getItem('numPages');
  for (let i = 1; i <= numPages; i++) {
    let listItem = document.createElement('li');
    listItem.setAttribute('data-page', i.toString());
    if (i === 1) {
      listItem.classList.add('active-page');
    }

    listItem.innerHTML = i + '';
    list.appendChild(listItem);
  }

  addActionOnPagination();
}

function addActionOnPagination () {
  let pages = document.querySelectorAll('.pagination li');

  pages.forEach(page => {
    page.addEventListener('click', (event) => {
      const elem = event.target;
      const selectPage = elem.dataset['page'];

      if (selectPage !== currentPage.dataset['page']) {
        currentPage.classList.remove('active-page');
        elem.classList.add('active-page');
        currentPage = elem;

        const countVideosOnPage = localStorage.getItem('countVideosOnPage');
        const startPosition  = (countVideosOnPage-1) * (selectPage-1) + 1;
        localStorage.setItem('startPosition', startPosition);
      }

      parseVideos(JSON.parse(localStorage.getItem('response')));
    })
  });
}

function addEventSearchField() {
  const searchField = document.querySelector('.search-group input[type=text]');
  searchField.addEventListener('change', (event) => {
    const valueSearch = event.target['value'];
    getVideos(valueSearch);
  });
}

function initParameters () {
  const countVideosOnPage = 4;
  const totalVideosCount = 15;

  let numPages = Math.ceil((totalVideosCount - countVideosOnPage) / (countVideosOnPage - 1)) + 1;
  if (totalVideosCount - (numPages*(countVideosOnPage-1)) > 2) {
    numPages = numPages + 1;
  }

  localStorage.setItem('countVideosOnPage', countVideosOnPage.toString());
  localStorage.setItem('totalVideosCount', totalVideosCount.toString());
  localStorage.setItem('numPages', numPages);

  localStorage.setItem('titleBlockLength', '45');
  localStorage.setItem('channelNameLength', '29');
  localStorage.setItem('startPosition', '1');
  localStorage.setItem('page', '1');


}

window.onload = () => {
  generateHeader();
  generateMain();
  generateFooter();

  initParameters();
  initPagination();
  addEventSearchField();
  getVideos();

  currentPage = document.querySelector(".active-page");
};
