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