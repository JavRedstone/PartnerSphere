<svelte:head>
    <title>Partner Sphere | Catalog</title>
</svelte:head>
<script lang="ts">
  import { Partner } from '$lib/classes/structs/Partner';
  import DataTable, {
      Head,
      Body,
      Row,
      Cell,
      SortValue,
      Pagination,
  } from '@smui/data-table';
  import Select, { Option } from '@smui/select';
  import IconButton from '@smui/icon-button';
  import Dialog, { Title, Content, Actions } from '@smui/dialog';
  import { Label } from '@smui/common';
	import TextField from '@smui/textfield';
  import Button from '@smui/button';
  import Snackbar, { Label as SnackbarLabel, Actions as SnackbarActions } from '@smui/snackbar';
  import * as pdfMake from "pdfmake/build/pdfmake";
  import * as pdfFonts from "pdfmake/build/vfs_fonts";
  let snackbar: Snackbar;
  let snackbarMessage: string = '';

  let actionsDialog: Dialog;
  let actionsDialogPartner: Partner;
  let addDialog: Dialog;
  let editDialog: Dialog;
  let deleteDialog: Dialog;

  import { partners } from '$lib/stores/partnerStore';
  import { partnerFields, partnerFieldsBasic } from '$lib/classes/enums/PartnerFields';
  import { deleteDoc, type DocumentData, DocumentReference, setDoc } from 'firebase/firestore';
  import { getFirestoreDoc } from '$lib/firebase/firebase';
  import { StringHelper } from '$lib/classes/helpers/StringHelper';
  import { authStore } from '$lib/stores/authStore';
  import { PartnerFieldInput } from '$lib/classes/structs/PartnerFieldInput';
  import { organizationTypes } from '$lib/classes/enums/OrganizationType';
  import HelperText from '@smui/textfield/helper-text';

  import { onMount } from 'svelte';

  let items: Partner[] = [];
  let assignedItems: boolean = false;
  let sort: keyof Partner = 'name';
  let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
  let rowsPerPageList = [5, 10, 20, 50, 100];
  let rowsPerPage = rowsPerPageList[0];
  let currentPage = 0;

  $: if (items.length == 0 && !assignedItems) { items = Object.assign([], $partners); if ($partners.length > 0) assignedItems = true; }
  $: start = currentPage * rowsPerPage;
  $: end = Math.min(start + rowsPerPage, items.length);
  $: slice = items.slice(start, end);
  $: lastPage = Math.max(Math.ceil(items.length / rowsPerPage) - 1, 0);

  function handleSort() {
    items.sort((a, b) => {
    const [aVal, bVal] = [a[sort], b[sort]][
        sortDirection === 'ascending' ? 'slice' : 'reverse'
    ]();
    if (typeof aVal === 'string' && typeof bVal === 'string') {
        return aVal.localeCompare(bVal);
    }
    return Number(aVal) - Number(bVal);
    });
    items = items;
  }

  let searchField = 'All Fields';
  let searchValue = '';
  
  // handle search
  function handleSearch(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
    e.preventDefault();

    items = Object.assign([], $partners);
    
    if (searchField === 'All Fields') {
      let newItems = [];
      for (let item of items) {
        for (let key of Object.keys(item)) {
          if (item[key].toLowerCase().includes(searchValue.toLowerCase())) {
            newItems.push(item);
            break;
          }
        }
      }
      items = newItems;
    }
    else {
      let searchFieldIndex = partnerFieldsBasic.indexOf(searchField);
      let searchFieldKey = partnerFields[searchFieldIndex].key;
      let searchResults = items.filter((item) => {
        return item[searchFieldKey].toLowerCase().includes(searchValue.toLowerCase());
      });
      items = searchResults;
    }
  }

  function clearSearch() {
    searchField = 'All Fields';
    searchValue = '';
    items = Object.assign([], $partners);
  }

  function clickedActions(partner: Partner) {
    actionsDialogPartner = partner;
    actionsDialog.setOpen(true);
  }

  function openAdd() {
    setNewPartnerFields();
    addDialog.setOpen(true);
  }

  function openEdit() {
    setOldPartnerFields();
    editDialog.setOpen(true);
  }

  function openDelete() {
    deleteDialog.setOpen(true);
  }

  let newPartnerFields: PartnerFieldInput[] = [];
  let oldPartnerFields: PartnerFieldInput[] = [];
  setNewPartnerFields();
  setOldPartnerFields();

  // set new partnerfields
  function setNewPartnerFields() {
    newPartnerFields = [];
    partnerFields.forEach(
      (pf) => {
        if (pf.key === 'organizationType') {
          newPartnerFields.push(new PartnerFieldInput(pf.key, organizationTypes[0], ''));
        }
        else {
          newPartnerFields.push(new PartnerFieldInput(pf.key, '', ''));
        }
      }
    );
  }

  function setOldPartnerFields() {
    oldPartnerFields = [];
    if (actionsDialogPartner) {
      partnerFields.forEach(
        (pf) => {
          if (pf.key === 'organizationType') {
            oldPartnerFields.push(new PartnerFieldInput(pf.key, actionsDialogPartner.organizationType, ''));
          }
          else {
            oldPartnerFields.push(new PartnerFieldInput(pf.key, actionsDialogPartner[pf.key], ''));
          }
        }
      );
    }
    else {
      partnerFields.forEach(
        (pf) => {
          if (pf.key === 'organizationType') {
            oldPartnerFields.push(new PartnerFieldInput(pf.key, organizationTypes[0], ''));
          }
          else {
            oldPartnerFields.push(new PartnerFieldInput(pf.key, '', ''));
          }
        }
      );
    }
  }

  // check validity of new partner fields
  function checkNewPartnerFields() {
    for (let i = 0; i < newPartnerFields.length; i++) {
      let pf = partnerFields[i];
      let npf = newPartnerFields[i];

      if (pf.required && npf.value === '') {
        npf.errorMessage = `${pf.name} is required.`;
      }
      else if (npf.value !== '') {
        if (pf.type === 'email' && !npf.value.match(/\w+(@)\w+/g)) {
          npf.errorMessage = `${pf.name} must be a valid email address.`;
        }
        else if (pf.type === 'url' && !npf.value.match(/.+(:).+/g)) {
          npf.errorMessage = `${pf.name} must be a valid URL.`;
        }
        else {
          npf.errorMessage = '';
        }
      }
      else {
        npf.errorMessage = '';
      }
    }
  }

  function checkOldPartnerFields() {
    for (let i = 0; i < oldPartnerFields.length; i++) {
      let pf = partnerFields[i];
      let npf = oldPartnerFields[i];

      if (pf.required && npf.value === '') {
        npf.errorMessage = `${pf.name} is required.`;
      }
      else if (npf.value !== '') {
        if (pf.type === 'email' && !npf.value.match(/\w+(@)\w+/g)) {
          npf.errorMessage = `${pf.name} must be a valid email address.`;
        }
        else if (pf.type === 'url' && !npf.value.match(/.+(:).+/g)) {
          npf.errorMessage = `${pf.name} must be a valid URL.`;
        }
        else {
          npf.errorMessage = '';
        }
      }
      else {
        npf.errorMessage = '';
      }
    }
  }

  $: if (newPartnerFields) checkNewPartnerFields();
  $: if (oldPartnerFields) checkOldPartnerFields();

  function addPartner() {
    if ($authStore.currentUser == null) {
      sendSnackbarMessage('You must be logged in to add a partner.');
    }
    else {
      let id: string = StringHelper.generateRandomId();
      let partnerDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('partners', id);
      let newPartnerFieldsValues: any = {};
      newPartnerFieldsValues.id = id;
      newPartnerFieldsValues.uid = $authStore.currentUser.uid;
      newPartnerFields.forEach(
        (pf) => {
          newPartnerFieldsValues[pf.key] = pf.value;
        }
      );
      setDoc(partnerDoc, newPartnerFieldsValues).then(
        () => {
          sendSnackbarMessage('Added new partner successfully!');
          location.reload();
        }
      );
    }
  }

  function editPartner() {
    if (actionsDialogPartner) {
      if ($authStore.currentUser == null) {
        sendSnackbarMessage('You must be logged in to edit a partner.');
      }
      else {
        let partnerDoc: DocumentReference<DocumentData, DocumentData> = getFirestoreDoc('partners', actionsDialogPartner.id);
        let oldPartnerFieldsValues: any = {};
        oldPartnerFieldsValues.id = actionsDialogPartner.id;
        oldPartnerFieldsValues.uid = $authStore.currentUser.uid;
        oldPartnerFields.forEach(
          (pf) => {
            oldPartnerFieldsValues[pf.key] = pf.value;
          }
        );
        setDoc(partnerDoc, oldPartnerFieldsValues).then(
          () => {
            sendSnackbarMessage('Edited partner successfully!');
            location.reload();
          }
        );
      }
    }
  }

  function deletePartner() {
    if ($authStore.currentUser == null) {
      sendSnackbarMessage('You must be logged in to add a partner.');
    }
    else {
      let partnerDoc = getFirestoreDoc('partners', actionsDialogPartner.id);
      deleteDoc(partnerDoc).then(() => {
        sendSnackbarMessage('Partner deleted successfully.');
        location.reload();
      }).catch((error) => {
        sendSnackbarMessage('An error occurred while deleting the partner. Please try again later.');
      });
    }
  }

  // create pdf content layout
  function pdfContent(sections: any, pageWidth: number, pageHeight: number) {
    let pageSize = {
      width: pageWidth * 72,
      height: pageHeight * 72
    };
    let imageWidth = 1.0;
    let imagePercentage = 20;
    let pageMargins = [40, 60, 40, 60];
    let content = [];
    sections.forEach((section: any, si: any) => {
        content.push({
          text: section.heading || `Section ${si + 1}`,
          fontSize: 20,
          alignment: 'center',
          margin: [15, 15],
          // If it is the first section, do not insert a pageBreak
          pageBreak: si === 0 ? null : 'before'
        });
        section.images.forEach((image: any, j: any) => {
          content.push({
            image,
            alignment: 'center',
            width: (pageSize.width * imageWidth) * imagePercentage / 100,
            pageBreak: j !== 0 ? 'before' : null
          });
        });
        if (section.rows != undefined && section.rows.length > 0) {
          let tableBody = [];
          section.rows.forEach((row: any[]) => {
            tableBody.push(row);
          });
          content.push({
            layout: 'lightHorizontalLines',
            table: {
              headerRows: 1,
              widths: [ 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto' ],
              body: tableBody
            }
          });
        }
    });
    return {
      pageSize,
      content,
      pageMargins
    }
  };

  // open the new pdf
  function openPdf(sections: any, pageWidth: number, pageHeight: number) {
    let {pageSize, content, pageMargins} = pdfContent(sections, pageWidth, pageHeight);
    let docDefinition = {
      info: {  title: 'PartnerSphere Partner Catalog Report' },
      pageSize,
      content: content,
      pageMargins
    };

    pdfMake.createPdf(docDefinition).open();
  };

  // generate the report
  function generateReport() {
    let sections = [
      {
        heading: `PartnerSphere Partner Catalog Report`,
        images: [
          // Logo in base64
          'data:image/png;base64,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'
        ],
        rows: []
      },
    ];

    let rawArray: any[] = [[...partnerFieldsBasic]];

    for (let partner of $partners) {
      let row = [];
      for (let field of partnerFields) {
        row[partnerFields.indexOf(field)] = partner[field.key];
      }
      rawArray.push(row);
    }

    sections.push({
      heading: 'Partner Catalog Report',
      images: [],
      rows: rawArray
    });
    openPdf(sections, 20, 8);
  }

  // enable pdfmake fonts
  onMount(() => {
    (window as any).pdfMake.vfs = pdfFonts.pdfMake.vfs;
  });

  // send a snackbar message
  function sendSnackbarMessage(message: string): void {
    snackbar.close();
    snackbarMessage = message;
    snackbar.forceOpen();
  }
</script>

<div style="padding: 2rem;">
  <Snackbar bind:this={snackbar}>
      <SnackbarLabel>{ snackbarMessage }</SnackbarLabel>
      <SnackbarActions>
          <IconButton on:click={() => snackbar.close()} class="material-symbols-outlined">close</IconButton>
      </SnackbarActions>
  </Snackbar>
  <h1>Partner Catalog</h1>
  <h3>Add New Partner</h3>
  <Button color="secondary" variant="outlined" on:click={openAdd}>
    <Label>Add Partner</Label>
  </Button>
  <Button variant="outlined" on:click={generateReport}>
    <Label>Generate Report</Label>
  </Button>
  <h3>Catalog Search</h3>
  <form on:submit={handleSearch}>
    <div>
      <Select style="width: calc(100vw - 4rem)" bind:value={searchField} label="Search Field" hiddenInput input$name="Search Field">
        <Option value="All Fields">All Fields</Option>
        {#each partnerFieldsBasic as pf}
          <Option value={pf}>{pf}</Option>
        {/each}
      </Select>
    </div>
    <div>
      {#if searchField !== 'Organization Type'}
        <TextField style="width: calc(100vw - 4rem)" type="text" label={"Search " + searchField} bind:value={searchValue}></TextField>
      {:else}
        <Select style="width: 100%" bind:value={searchValue} label="Organization Type" hiddenInput input$name="Organization Type">
          {#each organizationTypes as ot}
            <Option value={ot}>{ot}</Option>
          {/each}
        </Select>
      {/if}
    </div>
    <Button color="secondary" variant="outlined" style="margin: 1rem; margin-left: 0" type="submit">
      <Label>Search</Label>
    </Button>
    <Button variant="outlined" on:click={clearSearch}>
      <Label>Clear</Label>
    </Button>
  </form>

  <h3>Catalog Data Table</h3>
  <DataTable
    sortable
    bind:sort
    bind:sortDirection
    on:SMUIDataTable:sorted={handleSort}
    table$aria-label="Partner list"
    style="width: calc(100vw - 4rem)"
  >
    <Head>
      <Row>
        {#each partnerFields as pf}
          <Cell columnId={pf.key}>
            <Label>{pf.name}</Label>
            <IconButton class="material-icons">arrow_upward</IconButton>
          </Cell>
        {/each}
        <Cell columnId="actions">
          <Label>Actions</Label>
        </Cell>
      </Row>
    </Head>
    <Body>
      {#each slice as item}
        <Row>
          {#each partnerFields as pf}
            <Cell columnId={pf.key}>
              {item[pf.key]}
            </Cell>
          {/each}
          <Cell columnId="actions">
            <Button color="secondary" variant="outlined" on:click={() => clickedActions(item)}>
              <Label>Actions</Label>
            </Button>
          </Cell>
        </Row>
      {/each}
    </Body>
  
    <Pagination slot="paginate">
      <svelte:fragment slot="rowsPerPage">
        <Label>Rows Per Page</Label>
        <Select variant="outlined" bind:value={rowsPerPage} noLabel>
          {#each rowsPerPageList as rpp}
            <Option value={rpp}>{rpp}</Option>
          {/each}
        </Select>
      </svelte:fragment>
      <svelte:fragment slot="total">
        {start + 1}-{end} of {items.length}
      </svelte:fragment>
   
      {#if currentPage !== 0}
        <IconButton
          class="material-icons"
          action="first-page"
          title="First page"
          on:click={() => (currentPage = 0)}
          >first_page</IconButton
        >
        <IconButton
          class="material-icons"
          action="prev-page"
          title="Prev page"
          on:click={() => currentPage--}
          >chevron_left</IconButton
        >
      {/if}
      {#if currentPage !== lastPage}
        <IconButton
          class="material-icons"
          action="next-page"
          title="Next page"
          on:click={() => currentPage++}
          >chevron_right</IconButton
        >
        <IconButton
          class="material-icons"
          action="last-page"
          title="Last page"
          on:click={() => (currentPage = lastPage)}
          >last_page</IconButton
        >
      {/if}
    </Pagination>
  </DataTable>

  <Dialog
    bind:this={actionsDialog}
  >
    <Title>Partner Actions</Title>
    <Actions>
      <Button variant="outlined">
        <Label>Cancel</Label>
      </Button>
      <Button color="secondary" variant="outlined" on:click={openEdit}>
        <Label>Edit</Label>
      </Button>
      <Button color="secondary" variant="outlined" on:click={openDelete}>
        <Label>Delete</Label>
      </Button>
    </Actions>
  </Dialog>

  <Dialog
    bind:this={addDialog}
    surface$style="width: calc(100vw - 4rem); max-width: calc(100vw - 4rem);"
  >
    <Title>Add Partner</Title>
    <Content>
      {#each partnerFields as pf, i}
        {#if i === 0}
            <h3>Basic Information</h3>
        {/if}
        {#if i === 4}
            <h3>Contact Information</h3>
        {/if}
        <div>
          {#if pf.key == "organizationType"}
            <Select style="width: 100%" bind:value={newPartnerFields[i].value} label="Organization Type" hiddenInput input$name="Organization Type">
              {#each organizationTypes as ot}
                <Option value={ot}>{ot}</Option>
              {/each}
            </Select>
          {:else}
            <TextField style="width: 100%" label={pf.name} type={pf.type} required={pf.required} bind:value={newPartnerFields[i].value}>
              <HelperText style="color: #F44336" persistent slot="helper">{newPartnerFields[i].errorMessage}</HelperText>
            </TextField>
          {/if}
        </div>
      {/each}
    </Content>
    <Actions>
      <Button variant="outlined">
        <Label>Cancel</Label>
      </Button>
      <Button color="secondary" variant="outlined" on:click={addPartner}>
        <Label>Add</Label>
      </Button>
    </Actions>
  </Dialog>

  <Dialog
    bind:this={editDialog}
    surface$style="width: calc(100vw - 4rem); max-width: calc(100vw - 4rem);"
  >
    <Title>Edit Partner</Title>
    <Content>
      {#each partnerFields as pf, i}
        {#if i === 0}
            <h3>Basic Information</h3>
        {/if}
        {#if i === 4}
            <h3>Contact Information</h3>
        {/if}
        <div>
          {#if pf.key == "organizationType"}
            <Select style="width: 100%" bind:value={oldPartnerFields[i].value} label="Organization Type" hiddenInput input$name="Organization Type">
              {#each organizationTypes as ot}
                <Option value={ot}>{ot}</Option>
              {/each}
            </Select>
          {:else}
            <TextField style="width: 100%" label={pf.name} type={pf.type}  bind:value={oldPartnerFields[i].value}>
              <HelperText style="color: #F44336" persistent slot="helper">{oldPartnerFields[i].errorMessage}</HelperText>
            </TextField>
          {/if}
        </div>
      {/each}
    </Content>
    <Actions>
      <Button variant="outlined">
        <Label>Cancel</Label>
      </Button>
      <Button color="secondary" variant="outlined" on:click={editPartner}>
        <Label>Edit</Label>
      </Button>
    </Actions>
  </Dialog>

  <Dialog
    bind:this={deleteDialog}
  >
    <Title>Delete Partner</Title>
    <Content>
      <p>Are you sure you want to delete {actionsDialogPartner ? actionsDialogPartner.name : ''} from your partners list?</p>
    </Content>
    <Actions>
      <Button variant="outlined">
        <Label>Cancel</Label>
      </Button>
      <Button color="secondary" variant="outlined" on:click={deletePartner}>
        <Label>Delete</Label>
      </Button>
    </Actions>
  </Dialog>
</div>