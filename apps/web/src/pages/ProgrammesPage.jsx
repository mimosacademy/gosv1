import React,{useEffect,useMemo,useState} from 'react';
import {Helmet} from 'react-helmet';
import {Link} from 'react-router-dom';
import {toast} from 'sonner';
import PageHeader from '@/components/PageHeader';
import StatCard from '@/components/StatCard';
import DataTable from '@/components/DataTable';
import StatusBadge from '@/components/StatusBadge';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';
import {CalendarRange,CheckCircle2,ClipboardList,GraduationCap,Plus,ExternalLink} from 'lucide-react';
import {formatDate,formatRM,formatRMCompact} from '@/lib/mockData';
import {list,subscribe} from '@/lib/pmsRepository';

const mapRow=(p)=>({...p,code:p.programme_code,clientName:p.client?.company_name??'—',contractValue:Number(p.total_revenue_incl_tax??0),participants:Number(p.no_of_pax??0),pic:p.pic?.full_name??'—',category:p.programme_category?.name??p.category??'—',progress:Number(p.completeness?.overall_score??0),status:p.programme_status?.name??'—'});

export default function ProgrammesPage(){
 const [rows,setRows]=useState([]); const [loading,setLoading]=useState(true);
 const load=async()=>{try{const {data}=await list('programme',{select:'*,client:client_id(company_name),pic:pic_id(full_name),programme_category:programme_category_id(name),programme_status:programme_status_id(name),completeness:completeness_score(overall_score)'});setRows((data??[]).map(mapRow));}catch(e){toast.error(e.message||'Unable to load programmes');}finally{setLoading(false)}};
 useEffect(()=>{load();const ch=subscribe('programme',load);return()=>{ch?.unsubscribe?.();}},[]);
 const inProgress=rows.filter(p=>/ongoing|progress/i.test(p.status)).length; const scheduled=rows.filter(p=>/planned|scheduled/i.test(p.status)).length; const totalParticipants=rows.reduce((s,p)=>s+p.participants,0); const orderBook=rows.reduce((s,p)=>s+p.contractValue,0);
 const columns=useMemo(()=>[
 {key:'code',label:'Code',className:'font-medium text-violet-700 whitespace-nowrap'},
 {key:'title',label:'Programme',render:p=><div className='min-w-52'><p className='font-medium text-slate-800'>{p.title}</p><p className='text-xs text-slate-400'>{p.category}</p></div>},
 {key:'clientName',label:'Client',className:'whitespace-nowrap'},
 {key:'contractValue',label:'Contract',className:'whitespace-nowrap font-medium',render:p=>formatRM(p.contractValue)},
 {key:'start_date',label:'Schedule',className:'whitespace-nowrap text-slate-500',render:p=>`${formatDate(p.start_date)} – ${formatDate(p.end_date)}`},
 {key:'pic',label:'PIC',className:'whitespace-nowrap'},{key:'participants',label:'Pax',className:'text-center'},
 {key:'progress',label:'Completeness',render:p=><div className='flex w-28 items-center gap-2'><Progress value={p.progress} className='h-2 bg-slate-100 [&>div]:bg-violet-600'/><span className='text-xs font-medium text-slate-500'>{p.progress}%</span></div>},
 {key:'status',label:'Status',render:p=><StatusBadge status={p.status}/>},
 {key:'hub',label:'',render:p=><Button asChild variant='ghost' size='sm' className='text-violet-700'><Link to={`/programmes/${p.id}`}>Open Hub <ExternalLink className='ml-1 h-3.5 w-3.5'/></Link></Button>}
 ],[]);
 return <div><Helmet><title>Programmes — MIMOS Academy PMS</title></Helmet><PageHeader title='Programmes' description='Central programme hub — live Supabase data with PostgreSQL relationships and realtime updates.'><Button variant='outline' onClick={()=>toast.info('Export can be added once the reporting format is approved')}><CalendarRange className='mr-2 h-4 w-4'/> Export Schedule</Button><Button className='bg-violet-600 hover:bg-violet-700' onClick={()=>toast.info('Use the programme creation form to add a record')}><Plus className='mr-2 h-4 w-4'/> New Programme</Button></PageHeader><div className='mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4'><StatCard title='Total Programmes' value={rows.length} icon={GraduationCap} tone='violet' hint='live portfolio'/><StatCard title='In Delivery' value={inProgress} icon={CalendarRange} tone='blue' hint='currently delivering'/><StatCard title='Scheduled' value={scheduled} icon={CheckCircle2} tone='amber' hint='planned'/><StatCard title='Order Book Value' value={formatRMCompact(orderBook)} icon={ClipboardList} tone='emerald' hint={`${totalParticipants} participants enrolled`}/></div><DataTable columns={columns} data={rows} loading={loading} searchKeys={['title','code','clientName','pic']} searchPlaceholder='Search programmes…' emptyTitle='No programmes found' emptyDescription='No live programme records match your search.'/></div>;
}
