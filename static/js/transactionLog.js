const round = (number) => {
  return (Math.floor(number * 1000) / 1000)
}

const selectOnValue = (elementId, selectValue) => {
  try {
    $(`#${elementId} option:selected`).removeAttr('selected')
    $(`#${elementId} option[value=${selectValue}]`).attr('selected', 'selected')
  } catch(err) {
    console.error(err)
    return
  }
}

$(document).ready(() => {
  let lengths = {}

  $('#search').click(() => {
    const date = {
      start: $('#dateStart').val(),
      end: $('#dateEnd').val()
    }
    console.log(date)
    $.getJSON('/transactionLog', date , (data) => {
      console.log(data)
      $('tbody').empty()
      for (let transaction of data.transactions) {
        $('tbody').append(
          `<tr>
            <th scope="row">${transaction.transactionId}</th>
            <td>${transaction.clientId}</td>
            <td>${transaction.itemName}</td>
            <td>${transaction.weight}</td>
            <td>${transaction.descreption}</td>
            <td>${transaction.price}</td>
            <td>${transaction.total}</td>
            <td>${transaction.paid}</td>
            <td>${transaction.type}</td>
            <td>${transaction.date}</td>
          </tr>`
        )
      }
    })
  })

  $("#print").click(function() {
    window.location.replace(`/print/${$(this).val()}/~?dateStart=${$('#dateStart').val()}&dateEnd=${$('#dateEnd').val()}`)
  })


  $("button#edit").each(function() {
    $(this).click(() => {
      $("#transactionId").val(this.value)
      readyFormWithData()
    })
  })

  const readyFormWithData = () => {
    $("#transactionType").attr('disabled', 'disabled')
    $.getJSON("/getTransactionById", { transactionId: $("#transactionId").val() }, (data) => {
      if (data.typeId) {
        $('select, input:not(#total)').not("#transactionType").removeAttr('disabled')
        if (data.typeId === "R" || data.typeId === "E") {
          $("#weight, #item, #price").attr('disabled', 'disabled')
        }
        else if (data.typeId == "B") { 
          $("#paid, #clientId, #clientName").attr('disabled', 'disabled')
        }
        try {
          selectOnValue('transactionType', `"${data.typeId}"`)
          $('#clientId').val(data.clientId)
          selectOnValue('clientName', data.clientId)
          selectOnValue('item', data.itemId || '0')
          $('#weight').val(data.weight)
          $('#descreption').val(data.descreption)
          $('#price').val(data.price)
          $('#total').val(data.total)
          $('#paid').val(data.paid)
        } catch(err) {
          console.error(err)
        }
      } 
      else 
        alert(data.status)
    })
  }

  $("#transactionId").change(readyFormWithData)

  $("#transactionId").focusout(function() {
    $("#save").removeAttr('disabled')
  })
  $("#transactionId").focusin(function() {
    $("#save").attr('disabled', 'disabled')
  })

  $.getJSON('/getClients', null, clients => {
    for (let client of clients){
      if (client.id === 1) continue
      else if (client.id < 0) {
        alert('حدث خطأ. الرجاء اعادة التشغيل')
        break
      }
      $("#clientName").append(
        `<option value=${client.id}>${client.name}</option>`
      )
    }
    lengths.clients = clients.length
  })

  $.getJSON('/getTypes', null, data => {
    for (let type of data){
      $("#item").append(
        `<option value=${type.id}>${type.name}</option>`
      )
    }
  })

  $("#clientId").change(function() {
    $('#clientName option:selected').removeAttr('selected')
    if (this.value > 1 && this.value <= lengths.clients) {
      $(`#clientName option[value=${this.value}]`).attr('selected', 'selected')
    } else {
      $('#stdoption2').attr('selected', 'selected')
      this.value = ''
      alert('لا يوجد عميل بهذا الرقم')
    }
  })

  $('#clientName').on('change', function () {
    $("#clientId").val(this.value)
  })

  $('#weight').on('change', () => {
    $('#total').val(round($('#price').val() * $('#weight').val()))
    $("#paid").val($("#total").val())
  })
  $('#price').on('change', () => {
    $('#total').val(round($('#weight').val() * $('#price').val()))
    $("#paid").val($("#total").val())
  })

  $("#save").click(() => {
    const para = {
      transactionId: $('#transactionId').val(),
      typeId: $('#transactionType option:selected').val(),
      typeName: $("#transactionType option:selected").text(),
      clientId: $('#clientId').val(),
      itemId: $('#item option:selected').val(),
      weight: $('#weight').val() || "0",
      descreption: $('#descreption').val(),
      price: $('#price').val() || "0",
      total: $('#total').val() || "0",
      paid: $('#paid').val() || "0",
      next: "transactionLog",
    }
    console.log(para)
   $.post('/editTransactionForm', para, (data) => {
      if (data[0] === "/")
        window.location.replace(data)
      else
        alert(data)
   })
  })

  $("#modal").on('hidden.bs.modal', () => {
    $('input').val('')
    $('select, input:not(#total)').removeAttr('disabled')
    $('option').removeAttr('selected')
    $('#stdoption1').attr('selected', 'selected')
    $('#stdoption2').attr('selected', 'selected')
    $('#stdoption3').attr('selected', 'selected')
  })
})