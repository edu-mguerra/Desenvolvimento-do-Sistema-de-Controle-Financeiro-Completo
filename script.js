document.addEventListener('DOMContentLoaded', function () {
  // Carregar dados salvos ao carregar a página
  loadTableData();

  const installmentCheckbox = document.getElementById('isInstallment');
  const installmentOptions = document.getElementById('installmentOptions');
  const dynamicInstallments = document.getElementById('dynamicInstallments');
  const parcelCheckboxes = document.querySelectorAll('.pcl');


  installmentCheckbox.addEventListener('change', function () {
    const isChecked = this.checked;
    installmentOptions.style.display = isChecked ? 'block' : 'none';
    dynamicInstallments.style.display = isChecked ? 'block' : 'none';

    parcelCheckboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
  });

  
  parcelCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function () {
      parcelCheckboxes.forEach(otherCheckbox => {
        if (otherCheckbox !== this) {
          otherCheckbox.checked = false;
        }
      });
    });
  });

  // adicionar nova linha na tabela
  document.getElementById('btnNew').addEventListener('click', function () {
    const forn = document.getElementById('forn').value;
    const cpj = document.getElementById('cpj').value;
    const prod = document.getElementById('prod').value;
    const dateCompraInput = document.getElementById('date-compra').value;
    const dateProcessamentoInput = document.getElementById('date-processamento');
    const dateProcessamentoValue = dateProcessamentoInput ? dateProcessamentoInput.value : '';
    const sectorType = document.getElementById('sectorType').value;
    const tipoPagamento = document.getElementById('tipo_pagamento').value;
    const amount = parseFloat(document.getElementById('amount').value);
    const type = document.getElementById('type').value;
    const isInstallment = document.getElementById('isInstallment').checked;
    const numInstallments = parseInt(document.getElementById('numInstallments').value);
    const dateInput2 = document.getElementById('date-comprovante').value;
    const dataParcelaElement = document.getElementById('data-parcela');
    const dataParcela = dataParcelaElement ? dataParcelaElement.value : null;

    const notaFiscal = document.getElementById('nota-fiscal-input').value; 
    const notaServico = document.getElementById('nota-servico-input').value; 




    const colaborador = prompt('Por favor, insira o nome do colaborador que fez o pagamento:');
    const colaborador2 = prompt('Por favor, insira o nome do colaborador que fez este lançamento:');

    // Logs para depuração
    console.log('Formulário preenchido:');
    console.log('Fornecedor:', forn);
    console.log('Produto:', prod);
    console.log('Data de compra:', dateCompraInput);
    console.log('Data de processamento:', dateProcessamentoValue);
    console.log('Data do comprovante:', dateInput2);
    console.log('Valor:', amount);
    console.log('Tipo de pagamento:', type);
    console.log('Parcelamento:', isInstallment);
    console.log('Número de parcelas:', numInstallments);
    console.log('Colaborador:', colaborador);
    console.log('Colaborador 2:', colaborador2);
    console.log('Nota fiscal:', notaFiscal);
    console.log('Nota de serviço:', notaServico);

    if (!prod || !amount || !type || !colaborador) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (!isValidDate(dateCompraInput)) {
      alert('Data de compra inválida.');
      return;
    }

    if (!isValidDate(dateInput2)) {
      alert('Data do comprovante inválida.');
      return;
    }

    let status = '';
    const statusCheckboxes = document.querySelectorAll('.state-2');
    let selectedCount = 0;
    statusCheckboxes.forEach(checkbox => {
      if (checkbox.checked) {
        status = checkbox.value;
        selectedCount++;
      }
    });

    if (selectedCount > 1) {
      alert('Você só pode selecionar um status por vez.');
      return;
    }

    if (isInstallment && numInstallments > 0) {
      let parcelaData = new Date(dataParcela);
      parcelaData.setHours(0, 0, 0, 0);


      parcelaData.setDate(parcelaData.getDate());

      let intervalDays = 0;
      let incrementMonth = false;

      parcelCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
          switch (checkbox.value) {
            case '1M':
              incrementMonth = true;
              break;
            case '28':
              intervalDays = 28;
              break;
            case '14':
              intervalDays = 14;
              break;
            case '7':
              intervalDays = 7;
              break;
          }
        }
      });

      const installmentAmount = (amount / numInstallments).toFixed(2);
      let installmentDate = new Date(parcelaData);

      for (let i = 1; i <= numInstallments; i++) {
        const newRow = {
          forn,
          prod: `${prod} (Parcela ${i}/${numInstallments})`,
          type,
          amount: `R$ ${parseFloat(installmentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          cpj,
          dateCompra: formatDate(dateCompraInput),
          dateInstallment: formatDate(installmentDate), 
          dateComprovante: formatDate(dateInput2),
          colaborador,
          colaborador2,
          sectorType,
          tipoPagamento,
          status,
          notaFiscal,
          notaServico
        };

        addRowToTable(newRow);

     
        if (intervalDays > 0) {
          installmentDate.setDate(installmentDate.getDate() + intervalDays);
        } else if (incrementMonth) {
          installmentDate.setMonth(installmentDate.getMonth() + 1);
        }
      }
    } else {
      const newRow = {
        forn,
        prod,
        type,
        amount: `R$ ${amount.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        cpj,
        dateCompra: formatDate(dateCompraInput),
        dateInstallment: null,
        dateComprovante: formatDate(dateInput2),
        colaborador,
        colaborador2,
        sectorType,
        tipoPagamento,
        status,
        notaFiscal,
        notaServico
      };

      addRowToTable(newRow);
    }


    saveTableData();
    updateSummary();
  });

  document.getElementById('add-nota-fiscal').addEventListener('click', function () {
    const notaFiscalInput = document.getElementById('nota-fiscal-input');
    const novaNotaFiscal = prompt('Digite a nova nota fiscal:');

    if (novaNotaFiscal) {
      // Adiciona a nova nota ao campo de input e limpa o campo após a adição
      if (notaFiscalInput.value) {
        notaFiscalInput.value += `, ${novaNotaFiscal}`;
      } else {
        notaFiscalInput.value = novaNotaFiscal;
      }
     
    }
  });

  document.getElementById('add-nota-servico').addEventListener('click', function () {
    const notaServicoInput = document.getElementById('nota-servico-input');
    const novaNotaServico = prompt('Digite a nova nota de serviço:');

    if (novaNotaServico) {
      if (notaServicoInput.value) {
        notaServicoInput.value += `, ${novaNotaServico}`;
      } else {
        notaServicoInput.value = novaNotaServico;
      }
     
    }
  });
  function isValidDate(dateString) {
    if (!dateString) return false;
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateString.match(regex)) return false;
    const date = new Date(dateString);
    return date.toISOString().startsWith(dateString);
  }

  function formatDate(dateString) {
    if (!dateString) {
      return ''; 
    }

    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Data inválida:', dateString);
      return 'Data inválida';
    }

    // Ajuste de data 
    date.setDate(date.getDate() + 1);

    return date.toLocaleDateString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit' });
  }




  function addRowToTable(rowData) {
    const tbody = document.querySelector('tbody');
    const tr = document.createElement('tr');

    const cells = [
      rowData.forn,               // Fornecedor
      rowData.prod,               // Descrição
      rowData.type,               // Categoria
      rowData.amount,             // Valor (R$)
      rowData.cpj,                // CPF/CNPJ
      rowData.dateCompra,         // Data da Compra
      rowData.dateComprovante,    // Data do Comprovante
      rowData.dateInstallment ? rowData.dateInstallment : '',  // Data das Parcelas
      rowData.colaborador,        // Colaborador Responsável pelo Pagamento
      rowData.colaborador2,       // Colaborador que Registrou
      rowData.sectorType,         // Setor de Origem
      rowData.tipoPagamento,      // Forma de Pagamento
      rowData.status || '',       // Situação
      rowData.notaFiscal,         // Nota Fiscal
      rowData.notaServico         // Nota de Serviço
    ];

    cells.forEach((cellContent, index) => {
      const td = document.createElement('td');
      td.textContent = cellContent;
      tr.appendChild(td);
    });


    const tdAction = document.createElement('td');
    const statusBtn = document.createElement('button');
    statusBtn.textContent = 'Alterar Status';
    statusBtn.classList.add('status-btn');
    statusBtn.addEventListener('click', function () {
      const statusCell = tr.children[12]; 
      if (statusCell.textContent === 'A Pagar' || statusCell.textContent === '') {
        statusCell.textContent = 'Pago';
      } else if (statusCell.textContent === 'Pago') {
        statusCell.textContent = 'Cancelado';
      } else {
        statusCell.textContent = 'A Pagar';
      }
      saveTableData();
      updateSummary();
    });
    tdAction.appendChild(statusBtn);
    tr.appendChild(tdAction);

    // Adiciona o botão de exclusão
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'CANCELAR';
    deleteBtn.classList.add('delete-btn');

    deleteBtn.addEventListener('click', function () {
      const isInstallmentRow = tr.classList.contains('installment-row');
      if (isInstallmentRow) {
        const choice = confirm('Deseja excluir apenas esta parcela ou todas as parcelas?\n\nOK: Apenas esta\nCancelar: Todas');
        if (choice) {
          tr.remove(); // Exclui parcela selecionada
        } else {
          const parentRows = tr.parentElement.querySelectorAll('.installment-row');
          parentRows.forEach((row) => row.remove()); // Exclui todas as parcelas
        }
      } else {
        const password = prompt('Digite a senha para confirmar a exclusão:');
        if (password === '1234') {
          tr.remove();
          alert('Registro excluído com sucesso!');
        } else {
          alert('Senha incorreta. Operação cancelada.');
        }
      }
      saveTableData();
      updateSummary();
    });

    const tdDeleteAction = document.createElement('td');
    tdDeleteAction.appendChild(deleteBtn);
    tr.appendChild(tdDeleteAction);

    tbody.appendChild(tr);
  }




  function saveTableData() {
    const rows = [];
    document.querySelectorAll('tbody tr').forEach(row => {
      const cells = Array.from(row.children).slice(0, -1); 
      const rowData = cells.map(cell => cell.textContent);
      rows.push(rowData);
    });
    localStorage.setItem('tableData', JSON.stringify(rows));
  }



  function loadTableData() {
    const storedData = localStorage.getItem('tableData');
    if (storedData) {
      const rows = JSON.parse(storedData);
      rows.forEach(rowData => {
        const newRow = {
          forn: rowData[0],
          prod: rowData[1],
          type: rowData[2],
          amount: rowData[3],
          cpj: rowData[4],
          dateCompra: rowData[5],
          dateComprovante: rowData[6], // Certifique-se de incluir essa linha
          dateInstallment: rowData[7],
          colaborador: rowData[8],
          colaborador2: rowData[9],
          sectorType: rowData[10],
          tipoPagamento: rowData[11],
          status: rowData[12],
          notaFiscal: rowData[13],
          notaServico: rowData[14]
        };
        addRowToTable(newRow);
      });
    }
  }


  function updateSummary() {
    
  }
});


//pdf
const pdfButton = document.querySelector('.pdf');
pdfButton.addEventListener('click', exportToPDF);
function exportToPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF('landscape'); // Usa orientação paisagem para mais espaço

  // Definir margens
  const marginTop = 20;
  const marginLeft = 14;
  const marginRight = 14;

  // Título do PDF (geral)
  

  // Define a fonte para o conteúdo
  doc.setFontSize(12);

  const rows = Array.from(document.querySelectorAll('tbody tr')).map(tr => {
    const tds = Array.from(tr.children);
    return {
      forn: tds[0].textContent,
      prod: tds[1].textContent,
      type: tds[2].textContent,
      amount: tds[3].textContent,
      cpj: tds[4].textContent,
      dateCompra: tds[5].textContent,
      dateComprovante: tds[6].textContent,
      dateInstallment: tds[7].textContent,
      colaborador: tds[8].textContent,
      colaborador2: tds[9].textContent,
      sectorType: tds[10].textContent,
      tipoPagamento: tds[11].textContent,
      status: tds[12].textContent,
      notaFiscal: tds[13].textContent,
      notaServico: tds[14].textContent
    };
  });

  rows.forEach((item, index) => {
    // Para a primeira página, o título já foi adicionado
    if (index > 0) {
      doc.addPage();
    }

    // Título de cada página
    const pageTitle = `Relatório de Registro - Item ${index + 1}`;
    doc.setFontSize(16);
    doc.text(pageTitle, marginLeft, marginTop);

    // Conteúdo do item
    let yPosition = marginTop + 10;
    doc.setFontSize(12);
    doc.text(`Fornecedor: ${item.forn}`, marginLeft, yPosition);
    yPosition += 8;
    doc.text(`Descrição: ${item.prod}`, marginLeft, yPosition);
    yPosition += 8;
    doc.text(`Categoria: ${item.type}`, marginLeft, yPosition);
    yPosition += 8;
    doc.text(`Valor: ${item.amount}`, marginLeft, yPosition);
    yPosition += 8;
    doc.text(`CPF/CNPJ: ${item.cpj}`, marginLeft, yPosition);
    yPosition += 8;
    doc.text(`Data da Compra: ${item.dateCompra}`, marginLeft, yPosition);
    yPosition += 8;
    doc.text(`Data do Comprovante: ${item.dateComprovante}`, marginLeft, yPosition);
    yPosition += 8;
    doc.text(`Data das Parcelas: ${item.dateInstallment}`, marginLeft, yPosition);
    yPosition += 8;
    doc.text(`Colaborador: ${item.colaborador}`, marginLeft, yPosition);
    yPosition += 8;
    doc.text(`Tipo de Pagamento: ${item.tipoPagamento}`, marginLeft, yPosition);
    yPosition += 8;
    doc.text(`Status: ${item.status}`, marginLeft, yPosition);
    yPosition += 8;
    doc.text(`Nota Fiscal: ${item.notaFiscal}`, marginLeft, yPosition);
    yPosition += 8;
    doc.text(`Nota de Serviço: ${item.notaServico}`, marginLeft, yPosition);
  });

  doc.save('relatorio_registros.pdf');
}





//  Excel
document.querySelector('.excel').addEventListener('click', function() {
  // Pegando os dados da tabela
  const table = document.querySelector('.tabela-financeira');
  const rows = table.querySelectorAll('tr');

  // Array para armazenar os dados da tabela
  const data = [];

  // Iterando pelas linhas da tabela, ignorando o cabeçalho
  for (let i = 1; i < rows.length; i++) { // Começa de 1 para ignorar a primeira linha (cabeçalho)
    const row = rows[i];
    const cells = row.querySelectorAll('td');
    const fornecedor = cells[0].innerText.trim();
    const valor = parseFloat(cells[1].innerText.trim().replace('R$', '').replace(',', '.'));
    const dataFormatada = cells[2].innerText.trim();

    data.push({
      Fornecedor: fornecedor,
      Valor: valor,
      Data: dataFormatada
    });
  }

  // Gerando o nome do arquivo com data e hora
  const date = new Date();
  const formattedDate = date.toLocaleDateString('pt-BR').replace(/\//g, '-');
  const formattedTime = date.toLocaleTimeString('pt-BR').replace(/:/g, '-');
  const fileName = `FINANCEIRO_${formattedDate}_${formattedTime}.xlsx`;

  // Gerando o arquivo Excel
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Ajustando a largura das colunas para que caibam bem os dados
  worksheet['!cols'] = [
    { wpx: 250 }, // Fornecedor
    { wpx: 120 }, // Valor
    { wpx: 150 }  // Data
  ];

  // Colorindo a primeira linha (cabeçalho) de amarelo
  const headerCells = worksheet['!rows'] = worksheet['!rows'] || [];
  const header = [{ s: { fill: { fgColor: { rgb: 'FFFF00' } } } }];
  headerCells[0] = header[0]; // Aplica a formatação à primeira linha (cabeçalho)

  // Adicionando a planilha ao livro de trabalho
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');

  // Gerando o buffer Excel em base64
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'base64' });

  // Criando o link com a URL base64
  const dataUri = 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,' + excelBuffer;

  // Criando o link de download
  const link = document.createElement('a');
  link.href = dataUri;
  link.download = fileName;  // Define o nome do arquivo
  link.click();              // Simula o clique para iniciar o download
});

document.querySelector('.clear').addEventListener('click', function(){
  const pass = prompt("Digite a senha para APAGAR TODOS OS REGISTROS:")

  if(pass === '1234'){
    localStorage.clear()
    alert("Dados Apagados, atualize a pagina")

  }
})

