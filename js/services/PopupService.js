const idList = [];
const DEFAULT_POPUP_HTML =
  '<div id="unassigned" class="popup topRight">' +
  '<div class="popupHeader">' +
  '<div class="popupTitle"></div>' +
  '<div class="popupIcons">' +
  '<a href="#" class="popup-closer glyphicon glyphicon-medium glyphicon-remove"></a>'
  +
  '</div>' +
  '</div>' +
  '<div class="popup-content"> RANDOM STUFF CONTENT' +
  '</div>' +
  '</div>';
export default class PopupService {
  static createPopup(id, isTopLeft) {
    // TODO: replace unassigned with id, add id to idList, change position class if needs be
    if (idList.indexOf(id) > -1) {
      return;
    }
    let popupHtml = DEFAULT_POPUP_HTML;
    popupHtml = popupHtml.replace('unassigned', id);
    idList.push(id);
    if (isTopLeft) {
      popupHtml.replace('topRight', 'topLeft');
    }
    $('#main').append(popupHtml);
  }

  static removePopup(id) {
    // TODO: remove popup with the given id
  }

  static addPopupContent(id, content) {
    // TODO: add popup content for the given id popup
  }

  static removePopupContent(id) {
    // TODO: remove content within the given id popup
  }
}

