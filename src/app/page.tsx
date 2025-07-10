"use client";

import { useState, useRef } from 'react';
import { Container, Row, Col, Form, Button, Table, InputGroup, Card } from 'react-bootstrap';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface Item {
  description: string;
  quantity: number;
  price: number;
}

export default function Home() {
  // Form State
  const [companyName, setCompanyName] = useState('บริษัทของคุณ');
  const [companyAddress, setCompanyAddress] = useState('ที่อยู่บริษัท');
  const [customerName, setCustomerName] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [quoteNumber, setQuoteNumber] = useState('Q-2024001');
  const [quoteDate, setQuoteDate] = useState(new Date().toISOString().split('T')[0]);

  const [items, setItems] = useState<Item[]>([{ description: '', quantity: 1, price: 0 }]);
  const [laborCost, setLaborCost] = useState(0);
  const [notes, setNotes] = useState('ขอบคุณที่ให้ความไว้วางใจในบริการของเรา');


  const quoteRef = useRef<HTMLDivElement>(null);

  const handleAddItem = () => {
    setItems([...items, { description: '', quantity: 1, price: 0 }]);
  };

  const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const calculateSubtotal = () => {
    return items.reduce((acc, item) => acc + item.quantity * item.price, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    return subtotal + laborCost;
  };

  const handleDownloadPdf = () => {
    const input = quoteRef.current;
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgProps = pdf.getImageProperties(imgData);
        const ratio = imgProps.width / imgProps.height;
        const imgHeight = pdfWidth / ratio;
        let height = imgHeight;
        if (height > pdfHeight) {
          height = pdfHeight;
        }
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, height);
        pdf.save(`${quoteNumber}.pdf`);
      });
    }
  };

  const handleDownloadImage = () => {
    const input = quoteRef.current;
    if (input) {
      html2canvas(input, { scale: 2 }).then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `${quoteNumber}.png`;
        link.click();
      });
    }
  };

  return (
    <Container className="my-5">
      <Row>
        {/* Form Section */}
        <Col md={7} className="mb-4">
          <Card>
            <Card.Body>
              <Card.Title as="h1" className="mb-4">สร้างใบเสนอราคา</Card.Title>
              
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>ชื่อบริษัทของคุณ</Form.Label>
                    <Form.Control type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>ที่อยู่บริษัท</Form.Label>
                    <Form.Control type="text" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>ชื่อลูกค้า</Form.Label>
                    <Form.Control type="text" placeholder="กรอกชื่อลูกค้า" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>ที่อยู่ลูกค้า</Form.Label>
                    <Form.Control type="text" placeholder="กรอกที่อยู่ลูกค้า" value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>เลขที่ใบเสนอราคา</Form.Label>
                    <Form.Control type="text" value={quoteNumber} onChange={(e) => setQuoteNumber(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>วันที่</Form.Label>
                    <Form.Control type="date" value={quoteDate} onChange={(e) => setQuoteDate(e.target.value)} />
                  </Form.Group>
                </Col>
              </Row>

              <hr />

              <h2 className="h4 my-3">รายการสินค้า/บริการ</h2>
              <Table responsive>
                <thead>
                  <tr>
                    <th style={{minWidth: "200px"}}>รายละเอียด</th>
                    <th>จำนวน</th>
                    <th>ราคา/หน่วย</th>
                    <th>รวม</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index}>
                      <td><Form.Control type="text" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} /></td>
                      <td><Form.Control type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseInt(e.target.value) || 1)} style={{width: "80px"}}/></td>
                      <td><Form.Control type="number" min="0" value={item.price} onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)} style={{width: "120px"}}/></td>
                      <td>{(item.quantity * item.price).toFixed(2)}</td>
                      <td><Button variant="outline-danger" size="sm" onClick={() => handleRemoveItem(index)}>X</Button></td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <Button variant="secondary" onClick={handleAddItem}>+ เพิ่มรายการ</Button>

              <hr />

              <Row className="mt-3">
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>หมายเหตุ</Form.Label>
                    <Form.Control as="textarea" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>ค่าแรง</Form.Label>
                    <InputGroup>
                      <InputGroup.Text>฿</InputGroup.Text>
                      <Form.Control type="number" min="0" value={laborCost} onChange={(e) => setLaborCost(parseFloat(e.target.value) || 0)} />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>

            </Card.Body>
          </Card>
        </Col>

        {/* Preview Section */}
        <Col md={5}>
          <h2 className="h4 mb-3">ตัวอย่างใบเสนอราคา</h2>
          <div style={{ position: "sticky", top: "20px" }}>
            <Card>
                <Card.Body ref={quoteRef} className="p-4" style={{fontSize: "0.8rem"}}>
                    <Row className="mb-4 align-items-center">
                        <Col xs={6}>
                            <h1 className="h4 mb-0">{companyName}</h1>
                            <p className="mb-0" style={{whiteSpace: "pre-line"}}>{companyAddress}</p>
                        </Col>
                        <Col xs={6} className="text-end">
                            <h2 className="h3 mb-1">ใบเสนอราคา</h2>
                            <p className="mb-0">เลขที่: {quoteNumber}</p>
                            <p className="mb-0">วันที่: {quoteDate}</p>
                        </Col>
                    </Row>

                    <Card className="mb-4">
                        <Card.Header><strong>เรียน:</strong> {customerName}</Card.Header>
                        <Card.Body>
                            <p className="mb-0" style={{whiteSpace: "pre-line"}}>{customerAddress}</p>
                        </Card.Body>
                    </Card>

                    <Table bordered>
                        <thead className="table-light">
                            <tr>
                                <th>#</th>
                                <th>รายละเอียด</th>
                                <th className="text-center">จำนวน</th>
                                <th className="text-end">ราคา/หน่วย</th>
                                <th className="text-end">ราคารวม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{item.description}</td>
                                    <td className="text-center">{item.quantity}</td>
                                    <td className="text-end">{item.price.toFixed(2)}</td>
                                    <td className="text-end">{(item.quantity * item.price).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    <Row className="justify-content-end">
                        <Col xs={6}>
                            <Table borderless size="sm">
                                <tbody>
                                    <tr>
                                        <td><strong>รวมเป็นเงิน</strong></td>
                                        <td className="text-end">{calculateSubtotal().toFixed(2)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>ค่าแรง</strong></td>
                                        <td className="text-end">{laborCost.toFixed(2)}</td>
                                    </tr>
                                    <tr className="table-light fw-bold">
                                        <td><strong>ยอดรวมทั้งสิ้น</strong></td>
                                        <td className="text-end">{calculateTotal().toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </Table>
                        </Col>
                    </Row>
                    
                    <hr />

                    <div className="mt-4">
                        <h6 className="fw-bold">หมายเหตุ</h6>
                        <p style={{whiteSpace: "pre-line", fontSize: "0.75rem"}}>{notes}</p>
                    </div>
                </Card.Body>
            </Card>
            <div className="d-grid gap-2 mt-3">
                <Button variant="success" onClick={handleDownloadPdf}>ดาวน์โหลด PDF</Button>
                <Button variant="info" onClick={handleDownloadImage}>ดาวน์โหลดรูปภาพ</Button>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
