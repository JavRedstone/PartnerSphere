<svelte:head>
    <title>Partner Sphere | Catalog</title>
</svelte:head>
<script lang="ts">
  import { OrganizationType } from '$lib/classes/enums/OrganizationType';
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
  import { Label } from '@smui/common';
	import TextField from '@smui/textfield';
  import Button from '@smui/button';

    
  let originalItems: Partner[] = [
    new Partner('a', 'a description', OrganizationType.INDIVIDUAL, 'a', 'a@gmail.com', 'aaa-aaa-aaaa', 'a street', 'a.com'),
    new Partner('b', 'b description', OrganizationType.EDUCATIONAL, 'b', 'b@gmail.com', 'bbb-bbb-bbbb', 'b street', 'b.com'),
    new Partner('c', 'c description', OrganizationType.NONPROFIT, 'c', 'c@gmail.com', 'ccc-ccc-cccc', 'c street', 'c.com'),
    new Partner('d', 'd description', OrganizationType.FORPROFIT, 'd', 'd@gmail.com', 'ddd-ddd-dddd', 'd street', 'd.com'),
    new Partner('e', 'e description', OrganizationType.RELIGIOUS, 'e', 'e@gmail.com', 'eee-eee-eeee', 'e street', 'e.com'),
    new Partner('f', 'f description', OrganizationType.INDIVIDUAL, 'f', 'f@gmail.com', 'fff-fff-ffff', 'f street', 'f.com'),
    new Partner('g', 'g description', OrganizationType.INDIVIDUAL, 'g', 'g@gmail.com', 'ggg-ggg-gggg', 'g street', 'g.com'),
    new Partner('h', 'h description', OrganizationType.INDIVIDUAL, 'h', 'h@gmail.com', 'hhh-hhh-hhhh', 'h street', 'h.com'),
    new Partner('i', 'i description', OrganizationType.INDIVIDUAL, 'i', 'i@gmail.com', 'iii-iii-iiii', 'i street', 'i.com'),
    new Partner('j', 'j description', OrganizationType.INDIVIDUAL, 'j', 'j@gmail.com', 'jjj-jjj-jjjj', 'j street', 'j.com')
  ];
  let items = Object.assign([], originalItems);
  let sort: keyof Partner = 'name';
  let sortDirection: Lowercase<keyof typeof SortValue> = 'ascending';
  let rowsPerPageList = [5, 10, 20, 50, 100];
  let rowsPerPage = rowsPerPageList[0];
  let currentPage = 0;

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

  let partnerFields = [
    'Name',
    'Description',
    'Organization Type',
    'Resources',
    'Email',
    'Phone',
    'Address',
    'Website'
  ];
  let searchField = 'All Fields';
  let searchValue = '';
  
  function handleSearch(e: SubmitEvent & { currentTarget: HTMLFormElement }) {
    e.preventDefault();

    items = Object.assign([], originalItems);
    
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
      let searchFieldIndex = partnerFields.indexOf(searchField);
      let searchFieldKey = Object.keys(items[0])[searchFieldIndex];
      let searchResults = items.filter((item) => {
        return item[searchFieldKey].toLowerCase().includes(searchValue.toLowerCase());
      });
      items = searchResults;
    }
  }

  function clearSearch() {
    searchField = 'All Fields';
    searchValue = '';
    items = Object.assign([], originalItems);
  }
</script>

<form on:submit={handleSearch}>
  <div>
    <Select bind:value={searchField} label="Search Field" hiddenInput input$name="Search Field">
      <Option value="All Fields">All Fields</Option>
      {#each partnerFields as pf}
        <Option value={pf}>{pf}</Option>
      {/each}
    </Select>
  </div>
  <div>
    <TextField style="width: 100%" type="text" label={"Search " + searchField} bind:value={searchValue}></TextField>
  </div>
  <Button style="margin: 1rem; margin-left: 0" type="submit">
    <Label>Submit</Label>
  </Button>
  <Button color="secondary" on:click={clearSearch}>
    <Label>Clear</Label>
  </Button>
</form>

<DataTable
  sortable
  bind:sort
  bind:sortDirection
  on:SMUIDataTable:sorted={handleSort}
  table$aria-label="User list"
  style="width: 100%;"
>
  <Head>
    <Row>
      {#each {length: partnerFields.length} as _, key}
        <Cell columnId={Object.keys(new Partner('','','','','','','',''))[key]}>
          <Label>{partnerFields[key]}</Label>
          <IconButton class="material-icons">arrow_upward</IconButton>
        </Cell>
      {/each}
    </Row>
  </Head>
  <Body>
    {#each slice as item}
      <Row>
        {#each Object.keys(item) as key}
          <Cell columnId={key}>
            {item[key]}
          </Cell>
        {/each}
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
        action="prev-page"
        title="Prev page"
        on:click={() => currentPage--}
        >chevron_left</IconButton
      >
      <IconButton
        class="material-icons"
        action="first-page"
        title="First page"
        on:click={() => (currentPage = 0)}
        >first_page</IconButton
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