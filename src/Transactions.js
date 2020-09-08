import React from 'react';
import FormFile from 'react-bootstrap/FormFile'
import Card from "react-bootstrap/Card";
import { readString } from 'react-papaparse'
import _ from 'lodash'
import moment from 'moment';
import Table from "react-bootstrap/Table";
import Modal from "react-bootstrap/Modal";
import Badge from "react-bootstrap/Badge";
import Form from "react-bootstrap/Form";
import Select from 'react-select';
import Storage from './Storage'
import sha256 from 'sha256'
import Button from "react-bootstrap/Button";

const Categories = {
  "Amazon": [
    /.*AMZN.*/
  ],
  "Bills": [
    /.*Launch Servicing.*/,
    /.*Spotify*/,
    /.*affirm\.com.*/,
    /.*AAA PAYMNT.*/,
    /.*GSUITE_lbert.i.*/,
    /.*Hulu.*/,
    /.*SONIC.NET.*/,
    /.*Netflix\.com.*/,
    /.*Patreon.*/,
    /.*TOYOTA.*/,
    /.*VERIZON.*/,
    /.*PGANDE.*/,
    /.*PELOTON.*/,
    /.*Online Banking Transfer.*Mar.*/,
    /.*Amazon web services.*/
  ],
  "CC Payments": [
    /.*CAPITAL ONE.*/,
    /.*BANK OF AMERICA CREDIT CARD BILL.*/,
    /.*CHASE CREDIT CRD.*/
  ],
  "KTC": [
    /.*KEEP THE CHANGE TRANSFER.*/
  ],
  "Medical": [
    /.*UCSF.*/,
    /.*WALGREENS.*/,
    /.*JOE'S PHARMACY.*/,
    /.*ONE MEDICAL.*/
  ],
  "Income": [
    /.*MLB ADVANCED MED.*/
  ],
  "Dining": [
    /.*CAVIAR*/,
    /^SQ .*/
  ],
  "Home Depot": [
    /.*THE HOME DEPOT*/
  ],
  "Transfers": [
    /.*Online Banking transfer.*/,
    /.*Online scheduled transfer.*/
  ],
  "ATM": [
    /.*BKOFAMERICA ATM.*/
  ]
}

const CategoryNames = [..._.keys(Categories), "Other"]

const expandSelect = arr => {
  return _.map(arr, item => {
    return {value: item, label: item}
  })
}

const CategoryOptions = expandSelect(CategoryNames)

const MoneyFormatter = new Intl.NumberFormat("en-US", {
  style   : "currency",
  currency: "USD"
})

const Monthly = (props) => {

  const byMonth = _.groupBy(props.transactions, e => e.moment.month())

  return (
    <Card>
      <Card.Body>
        <Table striped bordered hover size="sm" >
          <thead>
          <tr>
            <th>Month</th>
            <th>Txns</th>
            <th>Deposits</th>
            <th>Withdraws</th>
            <th>Sum</th>
            {_.map(CategoryNames, name => {
              return <th key={`cat-header-${name}`}>{name}</th>
            })}
          </tr>
          </thead>
          <tbody>
          {_.map(byMonth, (monthArr, index) => {
            return (
              <Month key={`transactions-month-${index}`} index={index} transactions={monthArr}/>
            )
          })}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  )
}

const Tags = props => {
  return (
    <div>
      {_.map(props.tags, tag => {
        return (
          <Badge key={`tags-${tag}`} variant="primary">{tag}</Badge>
        )
      })}
    </div>
  )
}

const TxnRow = props => {

  const [show, setShow] = React.useState(false)
  const [tags, setTags] = React.useState(expandSelect(props.txn.tags))

  const save = () => {

  }

  return (
    <tr>
      <td
        className='cursor-pointer'
        onClick={() => setShow(true)}
      >
        {props.txn.date}
      </td>
      <td
        className='cursor-pointer'
        onClick={() => setShow(true)}
      >
        {props.txn.desc}
      </td>
      <td>{MoneyFormatter.format(props.txn.amount)}</td>
      <td><Tags tags={props.txn.tags}/></td>
      <Modal
        show={show}
        onHide={() => setShow(false)}
        centered={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>{_.take(props.txn.id, 8)}...</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="date">
              <Form.Label>Date</Form.Label>
              <Form.Control readOnly={true} disabled={true} type="input" value={props.txn.date}/>
            </Form.Group>

            <Form.Group controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control readOnly={true} disabled={true} type="textarea" value={props.txn.desc}/>
            </Form.Group>

            <Form.Group controlId="amount">
              <Form.Label>Amount</Form.Label>
              <Form.Control readOnly={true} disabled={true} type="input" value={MoneyFormatter.format(props.txn.amount)}/>
            </Form.Group>

            <Form.Group controlId="tags">
              <Form.Label>Tags</Form.Label>
              <Select
                onChange={setTags}
                options={CategoryOptions}
                isMulti={true}
                value={tags}
              />
            </Form.Group>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={save}>Save</Button>
        </Modal.Footer>
      </Modal>
    </tr>
  )
}

const CategoryTable = props => {

  const total = _.sum(_.map(props.transactions, 'amount'))

  return (
    <div>
      <Table striped bordered hover size="sm" >
        <thead>
        <tr>
          <th>Date</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Tags</th>
        </tr>
        </thead>
        <tbody>
        {_.map(props.transactions, (txn, index) => {
          return (
            <TxnRow
              key={`category-table-${props.category}-${index}`}
              txn={txn}
            />
          )
        })}
        </tbody>
      </Table>
      <div className='text-right font-weight-bolder'>
        Total: {MoneyFormatter.format(total)}
      </div>
    </div>
  )
}

const CategoryItem = props => {

  const [show, setShow] = React.useState(false)

  const categoryClick = () => {
    setShow(true)
  }

  return (
    <td>
      <div>
        <Modal
          show={show}
          onHide={() => setShow(false)}
          centered={true}
          size='xl'
        >
          <Modal.Header closeButton>
            <Modal.Title>{props.category}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <CategoryTable {...props}/>
          </Modal.Body>
        </Modal>

      </div>
      <div
        className='cursor-pointer'
        onClick={categoryClick}
      >
      {MoneyFormatter.format(_.sum(_.map(props.transactions, "amount")))}
      </div>
    </td>
  )
}

const Month = props => {

  const month     = moment().month(props.index).format("MMMM")
  const size      = _.size(props.transactions)
  const moneys    = _.map(props.transactions, t => t.amount)
  const deposits  = _.filter(moneys, m => m > 0)
  const withdraws = _.filter(moneys, m => m < 0)

  const groupedTransactions = _.fromPairs(_.map(CategoryNames, name => {
    return [
      name,
      _.filter(props.transactions, t => _.indexOf(t.tags, name) >= 0)
    ]
  }))

  return (
    <tr>
      <td>{month}</td>
      <td>{size}</td>
      <td>{MoneyFormatter.format(_.sum(deposits))}</td>
      <td>{MoneyFormatter.format(_.sum(withdraws))}</td>
      <td>{MoneyFormatter.format(_.sum(moneys))}</td>
      {_.map(groupedTransactions, (transactions, cat) => {
        return (
          <CategoryItem
            key={`category-item-${cat}`}
            category={cat}
            transactions={transactions}
          />
        )
      })}
    </tr>
  )
}

const tagTransactions = txns => {
  return _.map(txns, transaction => {
    const tags = _.compact(_.map(Categories, (cats, catName) => {
      return !_.isEmpty(_.filter(cats, cat => transaction.desc.match(cat))) ? catName : null
    }))
    const out = _.isEmpty(tags) ? ["Other"] : tags
    return {
      ...transaction,
      tags: out
    }
  })
}

const parseTransactions = txns => {
  return _.compact(_.map(txns, t => {
    if(t[0]) {
      return {
        id    : computeHash(t),
        date  : t[0],
        desc  : t[1],
        amount: _.toNumber(t[2])
      }
    }
  }))
}

const embellishTransactions = txns => {
  return _.map(txns, txn => {
    return {
      ...txn,
      moment: moment(txn.date)
    }
  })
}

const computeHash = txn => {
  return sha256(_.join(txn, ','))
}

const Transactions = () => {

  const [transactions, setTransactions] = React.useState([])

  React.useEffect(() => {
    const txns = Storage.get("BOA")
    if(!_.isEmpty(txns)) {
      setTransactions(txns)
    }
  }, [])

  const fileSelected = (event) => {
    event.preventDefault()

    const reader = new FileReader()
    reader.onload = (e) => {
      const csv = readString(e.target.result)
      const rawTransactions = _.drop(csv.data, 8)
      const parsedTransactions = parseTransactions(rawTransactions)
      Storage.createAll("BOA", tagTransactions(parsedTransactions))
      setTransactions(parsedTransactions)
    }
    reader.readAsText(event.target.files[0])
  }

  return (
    <div>
      <Card>
        <Card.Body>
          <FormFile className='mb-3' onChange={fileSelected}/>
          <Monthly transactions={embellishTransactions(transactions)}/>
        </Card.Body>
      </Card>
    </div>
  )
}

export default Transactions;