
const tipoSolucionSelect = document.getElementById('tipoSolucion');
const tipoFormularioSelect = document.getElementById('tipoFormulario');
const formulario = document.getElementById('formulario');
const popup = document.getElementById('popup');
const closeButton = document.getElementById('close-button');
const adjuntoInput = document.getElementById('adjunto');

tipoSolucionSelect.addEventListener('change', (event) => {
  const selectedOption = event.target.value;
  tipoFormularioSelect.innerHTML = '';

  switch (selectedOption) {
    case '1':
      tipoFormularioSelect.innerHTML = '<option value="Certificado de Pensión">Certificado de Pensión</option>';
      break;
    case '2':
      tipoFormularioSelect.innerHTML = '<option value="Certificado de Fondo de Ahorro">Certificado de Fondo de Ahorro</option>';
      break;
    case '3':
      tipoFormularioSelect.innerHTML = '<option value="Certificado de Seguro de Educación">Certificado de Seguro de Educación</option>';
      break;
    case '4':
      tipoFormularioSelect.innerHTML = '<option value="Certificado Pensional Rentas Vitalicias">Certificado Pensional Rentas Vitalicias</option><option value="Informe de pagos y deducciones Rentas Vitalicias">Informe de pagos y deducciones Rentas Vitalicias</option><option value="Certificado de ingresos y retenciones Rentas Vitalicias">Certificado de ingresos y retenciones Rentas Vitalicias</option>';
      break;
    case '5':
      tipoFormularioSelect.innerHTML = '<option value="Certificado Pensional ARL">Certificado Pensional ARL</option><option value="Informe de pagos y deducciones ARL">Informe de pagos y deducciones ARL</option><option value="Certificado de ingresos y retenciones ARL">Certificado de ingresos y retenciones ARL</option>';
      break;
    default:
      break;
  }
});

formulario.addEventListener('submit', (event) => {
  event.preventDefault();

  const tipoDocumento = document.getElementById('tipoDocumento').value;
  const numeroDocumento = document.getElementById('numeroDocumento').value;
  const correoElectronico = document.getElementById('correo').value;
  const certificadoSolicitado = document.getElementById('tipoFormulario').value;
  const nombre = document.getElementById('nombre').value;
  /*const adjuntoFile = adjuntoInput.files[0];*/
  
  const datos = {
    "tipoDocumento": tipoDocumento,
    "numeroDocumento": numeroDocumento,
    "correoElectronico": correoElectronico,
    "certificadoSolicitado": certificadoSolicitado,
    "nombre":nombre,
    "origenSolicitud":"Pagina Web"
  };

  fetch('https://prod-166.westus.logic.azure.com:443/workflows/b44bbbcb1bc34052afef5833a787340d/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=_AUWQ3k3DaNXjo8Ko0Jzx0NMDXDPkI5TRYFTscVZnxY', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(datos)
  })
  .then((response) => response.text())
  .then((text) => {
    popup.style.display = 'block';
  });
});

closeButton.addEventListener('click', () => {
  popup.style.display = 'none';
  formulario.reset();
});